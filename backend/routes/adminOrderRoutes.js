import express from "express";
import { getAllOrders } from "../controllers/adminOrderController.js";
import { protect } from "../middleware/authMiddleware.js";
import  adminOnly  from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/orders", protect, adminOnly, getAllOrders);

export default router;