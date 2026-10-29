import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customer/customerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/admin/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js"
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { initSocket } from "./config/socket.js";

dotenv.config();

const app = express();

const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL].filter(
  Boolean,
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json());

//User
app.use("/api/customer", customerRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/products", productRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/chats", chatRoutes);

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

initSocket(httpServer, allowedOrigins);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
