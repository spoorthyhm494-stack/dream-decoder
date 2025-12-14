import Decoder from "../models/Decoder.js";
import { runAI } from "../utils/aiutils.js";

// ---------------------- CREATE DECODER ----------------------
export const createDecoder = async (req, res) => {
  try {
    const { dreamText } = req.body;

    if (!dreamText) {
      return res.status(400).json({ message: "Dream text is required" });
    }

    // Optional: AI interpretation
    const interpretation = await runAI(`Analyze this dream: ${dreamText}`);

    // Save to DB
    const decoder = await Decoder.create({
      user: req.user.id,
      dreamText,
      interpretation
    });

    res.status(201).json({ message: "Decoder created", decoder });
  } catch (error) {
    console.error("Create Decoder Error:", error);
    res.status(500).json({ message: "Failed to create decoder" });
  }
};

// ---------------------- GET ALL DECODERS ----------------------
export const getDecoders = async (req, res) => {
  try {
    const decoders = await Decoder.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(decoders);
  } catch (error) {
    console.error("Get Decoders Error:", error);
    res.status(500).json({ message: "Failed to fetch decoders" });
  }
};

// ---------------------- DECODE DREAM (AI) ----------------------
export const decodeDream = async (req, res) => {
  try {
    // FIX APPLIED HERE: Changed 'dream' to 'dreamText' to match the frontend request payload.
    const { dreamText } = req.body; 

    if (!dreamText) {
      return res.status(400).json({ message: "Dream text is required" });
    }
const aiConfig = {
        max_tokens: 100, 
        temperature: 0.5, 
    };

    const prompt = `Analyze and decode this dream psychologically and symbolically:\n${dreamText}`;
    const output = await runAI(prompt, aiConfig);

    res.status(200).json({ decoded: output });
  } catch (error) {
    console.error("Decoder Error:", error);
    res.status(500).json({ message: "Failed to decode dream" });
  }
};