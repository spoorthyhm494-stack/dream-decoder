import express from "express";
import { runAI } from "../utils/aiutils.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const output = await runAI(prompt);
    res.json({ response: output });
  } catch (err) {
    res.status(500).json({ message: "AI failed" });
  }
});

export default router;



