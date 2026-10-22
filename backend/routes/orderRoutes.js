import express from "express";
import { cancelMyOrder, getMyOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-orders", protect, getMyOrders);

router.patch("/:orderId/cancel", protect, cancelMyOrder);


export default router;
