import express from "express";
import { getMe, loginUser, logoutUser, registerUser } from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/me", getMe);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/logout", logoutUser);

export default router;