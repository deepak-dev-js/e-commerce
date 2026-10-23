import express from "express";
import { getMyProfile } from "../../controllers/userController.js";
import { cancelMyOrder, getMyOrders } from "../../controllers/orderController.js";
import {
  createPaymentOrder,
  verifyPayment,
} from "../../controllers/paymentController.js";
import {protect} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getMyProfile);

router.get("/orders", protect, getMyOrders);

router.patch("/:orderId/cancel", protect, cancelMyOrder);

router.post("/create-payment", protect, createPaymentOrder);
router.post("/verify-payment", protect, verifyPayment);

export default router;