import express from "express";
import { getMe, registerUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/me", getMe);

export default router;