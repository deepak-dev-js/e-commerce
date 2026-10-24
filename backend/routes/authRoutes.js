import express from "express";
import { forgotPassword, getMe, loginUser, logoutUser, registerUser, resetPassword } from "../controllers/auth/authController.js";
import { googleLogin } from "../controllers/auth/googleAuthController.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/me", getMe);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;