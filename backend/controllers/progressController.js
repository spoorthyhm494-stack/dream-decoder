// --- Imports based on your confirmed file structure ---
import Progress from "../models/progress.js";        // ✅ Corrected to lowercase 'progress.js'
import Roadmap from "../models/roadmap.js";          // ✅ Corrected to lowercase 'roadmap.js'
import FutureMessage from "../models/FutureMessage.js"; // ✅ Correct (Capital F & M)

// 🛑 IMPORTANT: Removed import lines for Dream and Task models to prevent ReferenceError.

// ---------------------- ADD/UPDATE PROGRESS (UNCHANGED) ----------------------
export const updateProgress = async (req, res) => {
  try {
    // Ensure userId exists
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Validate required fields (adjust based on your Progress model)
    const { goal, status, date } = req.body;
    if (!goal || !status || !date) {
      return res.status(400).json({ message: "All fields (goal, status, date) are required" });
    }

    // Create progress entry
    const progress = await Progress.create({
      goal,
      status,
      date,
      userId,
    });

    return res.status(201).json({ message: "Progress added", progress });
  } catch (err) {
    console.error("PROGRESS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- GET USER PROGRESS (FIXED FOR MISSING MODELS) ----------------------
export const getProgress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // 🎯 FIX: Adjusted Promise.all to ONLY count models that exist (Roadmap and FutureMessage).
    const [roadmapCount, futureMessages] = await Promise.all([
        // 1. Count Roadmaps
        Roadmap.countDocuments({ userId }),
        
        // 2. Count Future Messages
        FutureMessage.countDocuments({ userId })
    ]);

    // 🎯 FIX: Manually set missing counts to 0 so the frontend HTML template doesn't crash.
    const dreamCount = 0;
    const completedTasks = 0;

    // Return the aggregated statistics object
    return res.json({ 
        dreamCount,          // Now safely 0
        roadmapCount, 
        completedTasks,    // Now safely 0
        futureMessages 
    });
  } catch (err) {
    console.error("GET PROGRESS ERROR:", err);
    return res.status(500).json({ message: "Server error during progress aggregation" });
  }

};
