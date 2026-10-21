import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Admin Dashboard",
    user: {
      name: req.user.name,
      role: req.user.role,
    },
  });
});

export default router;