import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Chat from "../models/Chat.js";

let io;

const parseCookie = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .filter(Boolean)
      .map((item) => {
        const separator = item.indexOf("=");

        return [
          item.slice(0, separator).trim(),
          decodeURIComponent(item.slice(separator + 1).trim()),
        ];
      }),
  );

export const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // Authenticate every Socket.IO connection.
  io.use(async (socket, next) => {
    try {
      const cookies = parseCookie(socket.handshake.headers.cookie);
      const token = socket.handshake.auth?.token || cookies.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;

      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const room =
      socket.user.role === "admin" ? "admins" : `user:${socket.user._id}`;

    socket.join(room);

    socket.on("select_chat", async ({ chatId } = {}, callback) => {
      try {
        if (socket.user.role !== "admin") {
          return callback?.({
            success: false,
            message: "Only admins can select customer conversations.",
          });
        }

        if (typeof chatId !== "string" || !/^[a-f\d]{24}$/i.test(chatId)) {
          return callback?.({
            success: false,
            message: "Invalid chat ID.",
          });
        }

        const chat = await Chat.findById(chatId).select("_id customer");

        if (!chat) {
          return callback?.({
            success: false,
            message: "Chat not found.",
          });
        }

        // Leave the previously selected customer room.
        if (socket.data.chatCustomerId) {
          socket.leave(`user:${socket.data.chatCustomerId}`);
        }

        socket.data.chatCustomerId = chat.customer.toString();

        // Join the selected customer's room to receive their messages.
        socket.join(`user:${socket.data.chatCustomerId}`);

        callback?.({
          success: true,
          chatId: chat._id,
        });
      } catch (error) {
        console.error("Select chat error:", error);

        callback?.({
          success: false,
          message: "Failed to select conversation.",
        });
      }
    });

    socket.on("mark_messages_read", async ({ chatId } = {}, callback) => {
      try {
        if (typeof chatId !== "string" || !/^[a-f\d]{24}$/i.test(chatId)) {
          return callback?.({
            success: false,
            message: "Invalid chat ID.",
          });
        }

        const isAdmin = socket.user.role === "admin";

        const chat = isAdmin
          ? await Chat.findById(chatId)
          : await Chat.findOne({
              _id: chatId,
              customer: socket.user._id,
            });

        if (!chat) {
          return callback?.({
            success: false,
            message: "Chat not found or access denied.",
          });
        }

        // Find messages that this user has now read.
        const readMessageIds = [];

        chat.messages.forEach((message) => {
          if (
            isAdmin &&
            message.senderRole === "customer" &&
            !message.readByAdmin
          ) {
            message.readByAdmin = true;
            readMessageIds.push(message._id.toString());
          }

          if (
            !isAdmin &&
            message.senderRole === "admin" &&
            !message.readByCustomer
          ) {
            message.readByCustomer = true;
            readMessageIds.push(message._id.toString());
          }
        });

        // Reset the unread counter for the reader.
        if (isAdmin) {
          chat.unreadByAdmin = 0;
        } else {
          chat.unreadByCustomer = 0;
        }

        await chat.save();

        // Notify the sender that their messages have been read.
if (readMessageIds.length > 0) {
    const room = isAdmin ? `user:${chat.customer}` : "admins";

    const payload = {
        chatId: chat._id.toString(),
        readerRole: isAdmin ? "admin" : "customer",
        messageIds: readMessageIds,
    };

    getIO().to(room).emit("messages_read", payload);

    console.log("Messages read event emitted:", {
        room,
        ...payload,
    });
}

        callback?.({
          success: true,
          messageIds: readMessageIds,
        });
      } catch (error) {
        console.error("Mark messages read error:", error);

        callback?.({
          success: false,
          message: "Failed to mark messages as read.",
        });
      }
    });

    socket.on("send_message", async ({ text } = {}, callback) => {
      try {
        if (
          typeof text !== "string" ||
          !text.trim() ||
          text.trim().length > 2000
        ) {
          return callback?.({
            success: false,
            message: "Message must contain 1–2000 characters.",
          });
        }

        const isAdmin = socket.user.role === "admin";
        const customerId = isAdmin
          ? socket.data.chatCustomerId
          : socket.user._id.toString();

        // An admin must select a customer conversation first.
        if (!customerId) {
          return callback?.({
            success: false,
            message: "Select a customer conversation first.",
          });
        }

        let chat = await Chat.findOne({ customer: customerId });

        if (!chat && !isAdmin) {
          chat = await Chat.create({ customer: customerId });
        }

        if (!chat) {
          return callback?.({
            success: false,
            message: "Chat not found.",
          });
        }

        const message = {
          sender: socket.user._id,
          senderRole: isAdmin ? "admin" : "customer",
          text: text.trim(),
          readByAdmin: isAdmin,
          readByCustomer: !isAdmin,
        };

        chat.messages.push(message);
        chat.lastMessage = message.text;
        chat.lastMessageAt = new Date();

        if (isAdmin) {
          chat.unreadByCustomer += 1;
          chat.unreadByAdmin = 0;
        } else {
          chat.unreadByAdmin += 1;
          chat.unreadByCustomer = 0;
        }

        await chat.save();

        const savedMessage = chat.messages[chat.messages.length - 1];

        const payload = {
          chatId: chat._id,
          message: savedMessage,
        };

        // Send the message to the customer and update the admin inbox.
        if (isAdmin) {
          // Admin sent a message: notify the customer.
          getIO().to(`user:${customerId}`).emit("receive_message", payload);

          // Notify other admin sessions, excluding the current socket.
          socket.to("admins").emit("receive_message", payload);
        } else {
          // Customer sent a message: notify the admin inbox.
          getIO().to("admins").emit("receive_message", payload);
        }

        callback?.({
          success: true,
          message: savedMessage,
        });
      } catch (error) {
        console.error("Chat message error:", error);

        callback?.({
          success: false,
          message: "Failed to send message.",
        });
      }
    });

    console.log(`Socket connected: ${socket.user._id}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
