import express from "express";
import { createFutureMessage, getFutureMessages } from "../controllers/futureMessageController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/", protect, createFutureMessage);
router.get("/", protect, getFutureMessages);

export default router;
