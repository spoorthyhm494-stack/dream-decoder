import express from "express";
import { generateRoadmap, getRoadmap, updateRoadmapStep } from "../controllers/roadmapController.js";
import authMiddleware from "../utils/authMiddleware.js"; // Ensure this is the correct path

const router = express.Router();

// ---------------------------
//  Generate a new AI roadmap
// POST /api/roadmap/generate
// ---------------------------
router.post("/generate", authMiddleware, generateRoadmap);

// ---------------------------
//  Get all roadmaps of the logged-in user
// GET /api/roadmap
// ---------------------------
router.get("/", authMiddleware, getRoadmap);

// ---------------------------
// Update completion of a step
// PATCH /api/roadmap/update-step
// ---------------------------
router.patch("/update-step", authMiddleware, updateRoadmapStep);

export default router;

