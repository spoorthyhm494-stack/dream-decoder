import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
  updatePassword,
  updateTheme,
} from "../controllers/authController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Settings (protected)
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.put("/theme", protect, updateTheme);

export default router;
