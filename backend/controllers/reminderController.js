import Reminder from "../models/Reminder.js";

// Helper function to safely extract the authenticated user ID
// This handles common ways the ID is attached by middleware (req.user.id, req.user._id, req.userId)
const getUserId = (req) => {
    return req.user?.id || req.user?._id || req.userId;
};

// CREATE REMINDER
export const createReminder = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }
    
    // Extract the incoming 'text' and 'time' from the frontend
    const { text, time } = req.body; 

    // Input validation (matching schema requirements)
    if (!text || !time) {
        return res.status(400).json({ message: "Reminder text and time are required." });
    }

    // 🎯 FIX: Map the incoming 'text' to both 'title' and 'message' 
    // to satisfy the schema's 'required: true' fields.
    const reminder = await Reminder.create({ 
        userId: userId, 
        title: text,       
        message: text,     
        time: time,
        // Other schema fields (type, repeat, createdAt) will use defaults
    });

    res.status(201).json(reminder);
  } catch (err) {
    // Log the detailed Mongoose validation error to the console for debugging
    console.error("CREATE REMINDER CRASH DETAILS:", err); 
    res.status(500).json({ message: "Error creating reminder" });
  }
};

// GET ALL REMINDERS
export const getReminders = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }
    
    // Fetch only reminders belonging to the current user, sorted by time
    const reminders = await Reminder.find({ userId }).sort({ time: 1 }); 
    res.json(reminders);
  } catch (err) {
    console.error("GET REMINDERS CRASH:", err); 
    res.status(500).json({ message: "Error fetching reminders" });
  }
};

// UPDATE REMINDER
export const updateReminder = async (req, res) => {
  try {
    const userId = getUserId(req);

    // 🔒 SECURITY FIX: Use findOneAndUpdate to ensure the reminder belongs to the user
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: userId }, 
      req.body,
      { new: true }
    );
    
    if (!reminder) {
        return res.status(404).json({ message: "Reminder not found or unauthorized to update" });
    }

    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: "Error updating reminder" });
  }
};

// DELETE REMINDER
export const deleteReminder = async (req, res) => {
  try {
    const userId = getUserId(req);

    // 🔒 SECURITY FIX: Use findOneAndDelete to ensure the reminder belongs to the user
    const result = await Reminder.findOneAndDelete({ _id: req.params.id, userId: userId });
    
    if (!result) {
        return res.status(404).json({ message: "Reminder not found or unauthorized to delete" });
    }

    res.json({ message: "Reminder deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting reminder" });
  }
};