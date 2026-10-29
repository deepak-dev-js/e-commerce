import express from "express";

import {
  getMyChat,
  getAllChats,
  getChatById,
} from "../controllers/chatController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js"

const router = express.Router();

// Customer routes
router.get("/my-chat", protect, getMyChat);

// Admin routes
router.get("/", protect, adminOnly, getAllChats);

router.get("/:chatId", protect, adminOnly, getChatById);

export default router;