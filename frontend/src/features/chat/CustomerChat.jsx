import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { socket } from "../../socket.js";

const API_URL = import.meta.env.VITE_API_URL;

function CustomerChat() {
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [connected, setConnected] = useState(socket.connected);

    const messagesEndRef = useRef(null);
    const chatIdRef = useRef(null);

    // Load the customer's existing conversation.
    useEffect(() => {
        const loadChat = async () => {
            try {
                const response = await fetch(`${API_URL}/api/chats/my-chat`, {
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load chat.");
                }

                const currentChat = data.chat || data;

                setChat(currentChat);
                chatIdRef.current = currentChat._id;
                setMessages(currentChat.messages || []);
            } catch (error) {
                toast.error(error.message || "Unable to load support chat.");
            } finally {
                setLoading(false);
            }
        };

        loadChat();
    }, []);

    // Connect to Socket.IO and listen for incoming messages.
    useEffect(() => {
        if (!chat?._id) return;

        const handleReceiveMessage = (payload) => {
            if (String(payload.chatId) !== String(chatIdRef.current)) {
                return;
            }

            const incomingMessage = payload.message;

            setMessages((currentMessages) => {
                const alreadyExists = currentMessages.some(
                    (message) =>
                        String(message._id) === String(incomingMessage._id),
                );

                if (alreadyExists) {
                    return currentMessages;
                }

                return [...currentMessages, incomingMessage];
            });

            // Mark incoming admin messages as read when the chat is visible.
            if (
                incomingMessage.senderRole === "admin" &&
                document.visibilityState === "visible"
            ) {
                socket.emit(
                    "mark_messages_read",
                    { chatId: chatIdRef.current },
                    (result) => {
                        if (!result?.success) {
                            console.error(
                                result?.message || "Unable to mark messages as read.",
                            );
                        }
                    },
                );
            }
        };

        const handleConnect = () => setConnected(true);
        const handleDisconnect = () => setConnected(false);

       const handleMessagesRead = ({
    chatId,
    readerRole,
    messageIds = [],
}) => {
    if (
        readerRole !== "admin" ||
        String(chatId) !== String(chatIdRef.current)
    ) {
        return;
    }

    const readIds = new Set(messageIds.map(String));

    setMessages((currentMessages) =>
        currentMessages.map((message) =>
            readIds.has(String(message._id))
                ? { ...message, readByAdmin: true }
                : message,
        ),
    );
};

        socket.on("receive_message", handleReceiveMessage);
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("messages_read", handleMessagesRead);

        const markMessagesRead = () => {
            socket.emit("mark_messages_read", { chatId: chat._id }, (result) => {
                if (!result?.success) {
                    console.error(
                        result?.message || "Unable to mark messages as read.",
                    );
                }
            });
        };

        if (socket.connected) {
            markMessagesRead();
        } else {
            socket.connect();
            socket.once("connect", markMessagesRead);
        }


        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("connect", handleConnect);
            socket.off("connect", markMessagesRead);
            socket.off("disconnect", handleDisconnect);
            socket.off("messages_read", handleMessagesRead);
        };


    }, [chat?._id]);

    // Scroll to the latest message.
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    // Send a message to the backend.
    const sendMessage = (event) => {
        event.preventDefault();

        const trimmedText = text.trim();

        if (!trimmedText || sending) return;

        if (!socket.connected) {
            toast.error("Chat is disconnected. Please try again.");
            return;
        }

        setSending(true);

        socket.emit("send_message", { text: trimmedText }, (response) => {
            setSending(false);

            if (!response?.success) {
                toast.error(response?.message || "Failed to send message.");
                return;
            }

            const savedMessage = response.message;

            // Add the saved message only if it isn't already present.
            setMessages((currentMessages) => {
                const alreadyExists = currentMessages.some(
                    (message) => String(message._id) === String(savedMessage._id),
                );

                if (alreadyExists) {
                    return currentMessages;
                }

                return [...currentMessages, savedMessage];
            });



            setText("");
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoaderCircle className="animate-spin" size={28} />
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="mx-auto mt-10 max-w-lg rounded-xl border p-6 text-center">
                <MessageCircle className="mx-auto mb-3" size={40} />
                <h2 className="text-xl font-semibold">Support Chat</h2>
                <p className="mt-2 text-gray-600">
                    We couldn't load your conversation. Please try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-lg bg-black px-5 py-2 text-white"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto flex h-[75vh] max-w-3xl flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                        <MessageCircle size={22} />
                    </div>

                    <div>
                        <h2 className="font-semibold">Customer Support</h2>
                        <p className="text-sm text-gray-500">
                            {connected ? "Connected" : "Connecting..."}
                        </p>
                    </div>
                </div>

                <span
                    className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-green-500" : "bg-red-500"
                        }`}
                />
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
                {messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                        <MessageCircle size={40} className="mb-3" />
                        <p className="font-medium">Welcome to ApnaShop Support</p>
                        <p className="mt-1 text-sm">
                            Send us a message. Our support team will help you.
                        </p>
                    </div>
                )}

                {messages.map((message) => {
                    const isCustomer = message.senderRole === "customer";

                    return (
                        <div
                            key={message._id}
                            className={`flex ${isCustomer ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[80%] break-words rounded-2xl px-4 py-2 ${isCustomer
                                    ? "rounded-br-sm bg-blue-600 text-white"
                                    : "rounded-bl-sm border bg-white text-gray-800"
                                    }`}
                            >
                                <div className="flex items-end gap-2">
                                    <p className="whitespace-pre-wrap">{message.text}</p>

                                    {isCustomer && (
                                        <span
                                            className={`shrink-0 text-xs ${message.readByAdmin ? "text-sky-300" : "text-blue-100"
                                                }`}
                                            title={message.readByAdmin ? "Seen" : "Sent"}
                                            aria-label={message.readByAdmin ? "Seen" : "Sent"}
                                        >
                                            {message.readByAdmin ? "✓✓" : "✓"}
                                        </span>
                                    )}
                                </div>


                                <p
                                    className={`mt-1 text-right text-xs ${isCustomer ? "text-blue-100" : "text-gray-400"
                                        }`}
                                >
                                    {message.createdAt
                                        ? new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : ""}
                                </p>
                            </div>
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={sendMessage} className="flex gap-2 border-t p-3">
                <input
                    type="text"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Type your message..."
                    maxLength={2000}
                    className="min-w-0 flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />

                <button
                    type="submit"
                    disabled={!text.trim() || sending || !connected}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {sending ? (
                        <LoaderCircle size={20} className="animate-spin" />
                    ) : (
                        <Send size={20} />
                    )}
                    <span className="hidden sm:inline">Send</span>
                </button>
            </form>
        </div>
    );
}

export default CustomerChat;