import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  title: { type: String, required: true },

  message: { type: String, required: true },

  time: { type: Date, required: true },   // actual schedule time

  type: { 
    type: String, 
    enum: ["roadmap", "motivation", "custom"], 
    default: "custom" 
  },

  repeat: { 
    type: String, 
    enum: ["daily", "once"], 
    default: "once" 
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Reminder", reminderSchema);
