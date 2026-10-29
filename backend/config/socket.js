import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
