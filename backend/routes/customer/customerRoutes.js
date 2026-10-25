import express from "express";
import { getMyProfile } from "../../controllers/customer/profileController.js";
import { cancelMyOrder, getMyOrders } from "../../controllers/customer/orderController.js";
import {
  createPaymentOrder,
  verifyPayment,
} from "../../controllers/customer/paymentController.js";
import {protect} from "../../middleware/authMiddleware.js";
import { createProductReview, getMyProductReviews } from "../../controllers/customer/reviewController.js";

const router = express.Router();

router.get("/profile", protect, getMyProfile);

router.get("/orders", protect, getMyOrders);

router.patch("/:orderId/cancel", protect, cancelMyOrder);

router.post("/create-payment", protect, createPaymentOrder);
router.post("/verify-payment", protect, verifyPayment);

router.post("/product/:id/review", protect, createProductReview); //Yahan :id product ki MongoDB ID hai.  protect middleware verify karega ki user logged in hai.

router.get("/review", protect, getMyProductReviews);

export default router;