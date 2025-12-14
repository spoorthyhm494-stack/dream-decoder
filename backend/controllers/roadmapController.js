import axios from "axios";
import Roadmap from "../models/roadmap.js";
import { createRoadmapReminders } from "../utils/scheduler.js";

// --------------------------------------------------
// GENERATE ROADMAP (AI) - FIXED (Robust JSON Parsing)
// --------------------------------------------------
export const generateRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { goal } = req.body;

    if (!goal) {
      return res.status(400).json({ message: "Goal is required" });
    }

    const prompt = `
Generate a detailed roadmap for the goal: "${goal}".
Return ONLY clean JSON in this exact structure:

{
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Short explanation",
      "duration": "2 weeks",
      "tasks": {
        "daily": ["Task 1", "Task 2"],
        "weekly": ["Task 1", "Task 2"]
      },
      "tools": ["Tool 1", "Tool 2"],
      "resources": {
        "youtube": ["Link 1", "Link 2"],
        "courses": ["Link 1", "Link 2"]
      },
      "completed": false
    }
  ],
  "finalChecklist": ["Checklist item 1", "Checklist item 2"]
}

ONLY RETURN JSON. DO NOT USE backticks.
`;

    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
       model: "google/gemini-2.5-flash", // Adjusted to a common OpenRouter ID
       max_tokens: 4096,

        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (aiResponse.status !== 200) {
        console.error("AI Service Response Error Status:", aiResponse.status, aiResponse.data);
        return res.status(500).json({ message: "AI service returned an unexpected status." });
    }

    let rawOutput = aiResponse.data.choices[0].message.content;

    // 🧹 CLEAN JSON - Phase 1: Strip markdown and trim whitespace
    let cleaned = rawOutput
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 🧹 CLEAN JSON - Phase 2: Find the exact boundaries of the JSON object
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
        console.error("AI JSON PARSING ERROR: Could not locate JSON structure.", rawOutput);
        return res.status(500).json({ message: "AI returned no recognizable JSON structure." });
    }

    // Extract ONLY the content from the first '{' to the last '}'
    cleaned = cleaned.substring(startIndex, endIndex + 1);

    let roadmapJSON;
    try {
      roadmapJSON = JSON.parse(cleaned);
    } catch (err) {
      console.error("AI JSON PARSING ERROR (Final Fail):", err.message, cleaned);
      return res.status(500).json({ message: "AI returned invalid JSON, cannot parse roadmap." });
    }
    
    const newRoadmap = await Roadmap.create({
      userId,
      goal,
      steps: roadmapJSON.steps || [],
      finalChecklist: roadmapJSON.finalChecklist || [],
      createdAt: new Date(),
    });

    await createRoadmapReminders(userId, roadmapJSON.steps);

    return res.status(201).json({
      message: "Roadmap created successfully",
      roadmap: newRoadmap,
    });
  } catch (err) {
    // **ENHANCED ERROR HANDLING**
    if (err.response) {
        // AI API responded with a status outside of 2xx (e.g., 401, 429)
        const status = err.response.status;
        const detail = err.response.data?.error?.message || err.response.data?.message || 'Unknown AI API Error';
        
        console.error(`AI API ERROR (Status ${status}):`, detail);
        
        return res.status(500).json({ 
            message: `Failed to communicate with AI service. Check API Key or Rate Limits. Status: ${status}` 
        });
    }

    // Handles network errors, missing environment variables, or uncaught DB errors
    console.error("ROADMAP ERROR (Internal):", err);
    return res.status(500).json({ message: "An unexpected server error occurred." });
  }
};

// --------------------------------------------------
// GET USER ROADMAPS (REQUIRED EXPORT)
// --------------------------------------------------
export const getRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;

    const roadmap = await Roadmap.find({ userId }).sort({ createdAt: -1 });

    return res.json({ roadmap });
  } catch (err) {
    console.error("GET ROADMAP ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// UPDATE ROADMAP STEP (REQUIRED EXPORT)
// --------------------------------------------------
export const updateRoadmapStep = async (req, res) => {
  try {
    const { roadmapId, stepIndex } = req.body;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    // toggle
    roadmap.steps[stepIndex].completed =
      !roadmap.steps[stepIndex].completed;

    await roadmap.save();

    const completed = roadmap.steps.filter((s) => s.completed).length;
    const total = roadmap.steps.length;
    const percent = Math.round((completed / total) * 100);

    return res.json({
      message: "Step updated",
      roadmap,
      progress: percent + "%",
    });
  } catch (err) {
    console.error("UPDATE STEP ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};