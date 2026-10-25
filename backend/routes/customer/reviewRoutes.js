import express from "express";
import { createProductReview } from "../../controllers/customer/reviewController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:id/reviews", protect, createProductReview); //Yahan :id product ki MongoDB ID hai.  protect middleware verify karega ki user logged in hai.

export default router;