import { useEffect, useRef, useState } from "react";
import {
    MessageCircle,
    Send,
    Search,
    UserRound,
    LoaderCircle,
    ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { socket } from "../../socket";

const API_URL = import.meta.env.VITE_API_URL;

function AdminChat() {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [search, setSearch] = useState("");
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [connected, setConnected] = useState(socket.connected);

    const messagesEndRef = useRef(null);
    const activeChatRef = useRef(null);

    // Keep the selected conversation available to socket event handlers.
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    // Load all customer conversations.
    useEffect(() => {
        const loadChats = async () => {
            try {
                const response = await fetch(`${API_URL}/api/chats`, {
                    credentials: "include",
                });

                const data = await response.json();

                console.log(data)

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load conversations.");
                }

                setChats(Array.isArray(data) ? data : data.chats || []);
            } catch (error) {
                toast.error(error.message || "Unable to load conversations.");
            } finally {
                setLoadingChats(false);
            }
        };

        loadChats();
    }, []);

    // Manage the Socket.IO connection and incoming messages.
    useEffect(() => {
        const handleConnect = () => setConnected(true);
        const handleDisconnect = () => setConnected(false);

        const handleReceiveMessage = ({ chatId, message }) => {
            const id = String(chatId);

            // Update the conversation preview and move it to the top.
            setChats((currentChats) => {
                const existingChat = currentChats.find(
                    (chat) => String(chat._id) === id,
                );

                if (!existingChat) {
                    // A new conversation may not be in the current list yet.
                    // Refresh the list from the server.
                    return currentChats;
                }

                const isActive =
                    String(activeChatRef.current?._id) === id;

                return [
                    {
                        ...existingChat,
                        lastMessage: message.text,
                        lastMessageAt: message.createdAt || new Date().toISOString(),
                        unreadByAdmin: isActive
                            ? 0
                            : (existingChat.unreadByAdmin || 0) +
                            (message.senderRole === "customer" ? 1 : 0),
                    },
                    ...currentChats.filter((chat) => String(chat._id) !== id),
                ];
            });

            // Add the message only to the currently selected conversation.
            if (String(activeChatRef.current?._id) === id) {
                setMessages((currentMessages) => {
                    const alreadyExists = currentMessages.some(
                        (item) => String(item._id) === String(message._id),
                    );

                    return alreadyExists
                        ? currentMessages
                        : [...currentMessages, message];
                });

                // Mark newly received customer messages as read.
                if (message.senderRole === "customer") {
                    socket.emit("mark_messages_read", { chatId: id }, (result) => {
                        if (!result?.success) {
                            console.error(
                                result?.message || "Unable to mark messages as read.",
                            );
                        }
                    });
                }
            }
        };


        const handleMessagesRead = ({
            chatId,
            readerRole,
            messageIds = [],
        }) => {
            console.log("Admin received messages_read:");
            if (
                readerRole !== "customer" ||
                String(chatId) !== String(activeChatRef.current?._id)
            ) {
                return;
            }

            setMessages((currentMessages) =>
                currentMessages.map((message) =>
                   messageIds.some((id) => String(id) === String(message._id))
    ? { ...message, readByCustomer: true }
    : message
                ),
            );
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("receive_message", handleReceiveMessage);
        socket.on("messages_read", handleMessagesRead);


        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("receive_message", handleReceiveMessage);
            socket.off("messages_read", handleMessagesRead);
        };
    }, []);

    // Scroll to the newest message.
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Select a conversation and load its saved messages.
    const selectChat = async (chat) => {
        setActiveChat(chat);
        activeChatRef.current = chat;
        setMessages([]);
        setLoadingMessages(true);

        try {
            const response = await fetch(
                `${API_URL}/api/chats/${chat._id}`,
                { credentials: "include" },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load messages.");
            }

            const selectedChat = data.chat || data;

            // Ignore a response if the admin selected another conversation
            // while this request was still loading.
            if (String(activeChatRef.current?._id) !== String(chat._id)) {
                return;
            }

            setActiveChat(selectedChat);
            activeChatRef.current = selectedChat;
            setMessages(selectedChat.messages || []);

            if (!socket.connected) {
                socket.connect();
            }

            socket.emit("select_chat", { chatId: chat._id }, (result) => {
                if (!result?.success) {
                    toast.error(result?.message || "Unable to select conversation.");
                }
            });

            socket.emit("mark_messages_read", { chatId: chat._id }, (result) => {
                if (!result?.success) {
                    console.error(result?.message || "Unable to mark messages as read.");
                }
            });

            setChats((currentChats) =>
                currentChats.map((item) =>
                    String(item._id) === String(chat._id)
                        ? { ...item, unreadByAdmin: 0 }
                        : item,
                ),
            );
        } catch (error) {
            toast.error(error.message || "Unable to load messages.");
        } finally {
            setLoadingMessages(false);
        }
    };

    // Send a reply to the selected customer.
    const sendMessage = (event) => {
        event.preventDefault();

        const trimmedText = text.trim();

        if (!trimmedText || sending || !activeChat) return;

        if (!socket.connected) {
            toast.error("Chat is disconnected. Please reconnect.");
            return;
        }

        setSending(true);

        socket.emit("send_message", { text: trimmedText }, (response) => {
            setSending(false);

            if (!response?.success) {
                toast.error(response?.message || "Failed to send reply.");
                return;
            }

            const savedMessage = response.message;
            const chatId = String(activeChatRef.current?._id);

            setMessages((currentMessages) => {
                const alreadyExists = currentMessages.some(
                    (message) => String(message._id) === String(savedMessage._id),
                );

                return alreadyExists
                    ? currentMessages
                    : [...currentMessages, savedMessage];
            });

            setChats((currentChats) =>
                currentChats.map((chat) =>
                    String(chat._id) === chatId
                        ? {
                            ...chat,
                            lastMessage: savedMessage.text,
                            lastMessageAt:
                                savedMessage.createdAt || new Date().toISOString(),
                        }
                        : chat,
                ),
            );

            setText("");
        });
    };

    const filteredChats = chats.filter((chat) => {
        const customer = chat.customer || {};

        const searchText = `${customer.name || ""} ${customer.email || ""
            }`.toLowerCase();

        return searchText.includes(search.toLowerCase());
    });

    const getCustomerName = (chat) =>
        chat.customer?.name || chat.customer?.email || "Customer";

    const formatTime = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="mx-auto max-w-7xl p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Customer Support
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage customer conversations and respond in real time.
                </p>
            </div>

            <div className="grid h-[75vh] min-h-[500px] grid-cols-1 overflow-hidden rounded-2xl border bg-white shadow-sm md:grid-cols-[320px_1fr]">
                {/* Conversation list */}
                <aside
                    className={`flex min-h-0 flex-col border-r ${activeChat ? "hidden md:flex" : "flex"
                        }`}
                >
                    <div className="border-b p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Conversations</h2>

                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                {chats.length}
                            </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2 rounded-lg border px-3">
                            <Search size={18} className="text-gray-400" />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search customers..."
                                className="w-full py-2.5 text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingChats ? (
                            <div className="flex justify-center p-8">
                                <LoaderCircle className="animate-spin" />
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <p className="p-6 text-center text-sm text-gray-500">
                                No conversations found.
                            </p>
                        ) : (
                            filteredChats.map((chat) => {
                                const selected =
                                    String(activeChat?._id) === String(chat._id);

                                return (
                                    <button
                                        key={chat._id}
                                        onClick={() => selectChat(chat)}
                                        className={`flex w-full gap-3 border-b p-4 text-left transition ${selected ? "bg-blue-50" : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                            <UserRound size={21} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                    {getCustomerName(chat)}
                                                </p>

                                                {chat.lastMessageAt && (
                                                    <span className="shrink-0 text-[11px] text-gray-400">
                                                        {formatTime(chat.lastMessageAt)}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 truncate text-xs text-gray-500">
                                                {chat.lastMessage || "Start a conversation"}
                                            </p>
                                        </div>

                                        {chat.unreadByAdmin > 0 && (
                                            <span className="flex h-5 min-w-5 items-center justify-center self-center rounded-full bg-blue-600 px-1 text-xs text-white">
                                                {chat.unreadByAdmin}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* Active conversation */}
                <section
                    className={`min-h-0 flex-col ${activeChat ? "flex" : "hidden md:flex"
                        }`}
                >
                    {!activeChat ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-gray-400">
                            <div className="mb-4 rounded-full bg-gray-100 p-5">
                                <MessageCircle size={36} />
                            </div>

                            <h2 className="text-lg font-semibold text-gray-700">
                                Select a conversation
                            </h2>

                            <p className="mt-2 max-w-sm text-sm">
                                Choose a customer from the list to view messages and reply.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <header className="flex items-center gap-3 border-b p-4">
                                <button
                                    onClick={() => {
                                        setActiveChat(null);
                                        activeChatRef.current = null;
                                        setMessages([]);
                                    }}
                                    className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
                                    aria-label="Back to conversations"
                                >
                                    <ArrowLeft size={20} />
                                </button>

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                    <UserRound size={21} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="truncate font-semibold">
                                        {getCustomerName(activeChat)}
                                    </h2>

                                    <p className="truncate text-xs text-gray-500">
                                        {activeChat.customer?.email || "Customer"}
                                    </p>
                                </div>

                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-green-500" : "bg-red-500"
                                        }`}
                                    title={connected ? "Connected" : "Disconnected"}
                                />
                            </header>

                            {/* Message history */}
                            <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
                                {loadingMessages ? (
                                    <div className="flex justify-center p-8">
                                        <LoaderCircle className="animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <p className="pt-10 text-center text-sm text-gray-400">
                                        No messages yet. Send the first reply.
                                    </p>
                                ) : (
                                    messages.map((message) => {
                                        const isAdmin = message.senderRole === "admin";

                                        return (
                                            <div
                                                key={message._id}
                                                className={`flex ${isAdmin ? "justify-end" : "justify-start"
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-[85%] break-words rounded-2xl px-4 py-3 ${isAdmin
                                                        ? "rounded-br-sm bg-blue-600 text-white"
                                                        : "rounded-bl-sm border bg-white text-gray-800"
                                                        }`}
                                                >
                                                    <div className="flex items-end gap-2">
                                                        <p className="whitespace-pre-wrap text-sm">
                                                            {message.text}
                                                        </p>

                                                        {isAdmin && (
                                                            <span
                                                                className={`shrink-0 text-xs ${message.readByCustomer ? "text-sky-300" : "text-blue-100"
                                                                    }`}
                                                                title={message.readByCustomer ? "Seen" : "Sent"}
                                                                aria-label={message.readByCustomer ? "Seen" : "Sent"}
                                                            >
                                                                {message.readByCustomer ? "✓✓" : "✓"}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p
                                                        className={`mt-1 text-right text-[11px] ${isAdmin ? "text-blue-100" : "text-gray-400"
                                                            }`}
                                                    >
                                                        {formatTime(message.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply input */}
                            <form
                                onSubmit={sendMessage}
                                className="flex gap-2 border-t bg-white p-3"
                            >
                                <input
                                    value={text}
                                    onChange={(event) => setText(event.target.value)}
                                    placeholder="Type your reply..."
                                    maxLength={2000}
                                    className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />

                                <button
                                    type="submit"
                                    disabled={!text.trim() || sending || !connected}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {sending ? (
                                        <LoaderCircle size={19} className="animate-spin" />
                                    ) : (
                                        <Send size={19} />
                                    )}

                                    <span className="hidden sm:inline">Reply</span>
                                </button>
                            </form>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AdminChat;