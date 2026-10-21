import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());


app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminOrderRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });