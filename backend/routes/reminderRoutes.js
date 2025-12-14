import express from "express";
import { createReminder, getReminders, updateReminder, deleteReminder } from "../controllers/reminderController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReminder);        // Create
router.get("/", protect, getReminders);          // List all
router.put("/:id", protect, updateReminder);     // Update
router.delete("/:id", protect, deleteReminder);  // Delete

export default router;
