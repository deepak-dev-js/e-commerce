import express from "express";
import { getMyOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-orders", protect, getMyOrders);

export default router;
