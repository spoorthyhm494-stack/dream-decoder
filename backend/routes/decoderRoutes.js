import express from "express";
import { createDecoder, getDecoders, decodeDream } from "../controllers/decoderController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

// Public route
router.post("/decode", decodeDream);

// Protected routes
router.post("/create", protect, createDecoder);
router.get("/all", protect, getDecoders);

export default router;
