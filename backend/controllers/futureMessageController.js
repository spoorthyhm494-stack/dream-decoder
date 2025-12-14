import FutureMessage from "../models/FutureMessage.js";

// ---------------- CREATE FUTURE MESSAGE ----------------
export const createFutureMessage = async (req, res) => {
  try {
    // 1. Destructure the exact fields sent from the frontend
    const { message, deliverAt } = req.body; 

    // 2. Input Validation (Checks if the user sent the data)
    if (!message || !deliverAt) {
      return res.status(400).json({ message: "Message and delivery date are required" });
    }

    // 3. Validate and Create Date Object (Fixes potential date format crash)
    const scheduledDate = new Date(deliverAt);

    if (isNaN(scheduledDate.getTime())) {
        console.error("FUTURE MSG ERROR: Invalid date format received:", deliverAt);
        return res.status(400).json({ message: "Invalid delivery date format." });
    }

    // 4. FIX: Use the exact field names from the FutureMessage model (message and unlockDate)
    const payload = { 
        userId: req.user.id, 
        message: message,           // Maps to 'message' in the schema
        unlockDate: scheduledDate   // Maps to 'unlockDate' in the schema
    };
    
    const fm = await FutureMessage.create(payload);
    return res.status(201).json({ message: "Future message saved", id: fm._id });
  } catch (err) {
    // Log the detailed error to the server console
    console.error("FUTURE MSG CRASH ERROR:", err.message); 
    return res.status(500).json({ message: "Server error: Failed to schedule message." });
  }
};

// ---------------- GET ALL FUTURE MESSAGES ----------------
export const getFutureMessages = async (req, res) => {
  try {
    // This function is already correct, as it uses the correct field name 'unlockDate'
    const list = await FutureMessage.find({ userId: req.user.id }).sort({ unlockDate: 1 });
    return res.json({ messages: list }); 
  } catch (err) {
    console.error("GET FUTURE MSG ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};