import express from "express";
import { protect } from "../utils/authMiddleware.js";
import {
  createDreamNote,
  getDreamNotes,
  updateDreamNote,
  deleteDreamNote
} from "../controllers/dreamNoteController.js";

const router = express.Router();

router.post("/", protect, createDreamNote);
router.get("/", protect, getDreamNotes);
router.put("/:id", protect, updateDreamNote);
router.delete("/:id", protect, deleteDreamNote);

export default router;
