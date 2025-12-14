import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  goal: {
    type: String,
    required: true,
  },

  steps: [
    {
      stepNumber: {
        type: Number,
        required: true,
        set: v => Number(v), // converts string to number
      },
      title: { type: String, required: true },
      description: { type: String },
      duration: { type: String },
      tasks: {
        daily: [String],
        weekly: [String],
      },
      tools: [String],
      resources: {
        youtube: [String],
        courses: [String],
      },
      completed: { type: Boolean, default: false },
    }
  ],

  finalChecklist: [String],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ⭐ FIX: Prevent OverwriteModelError
export default mongoose.models.Roadmap || mongoose.model("Roadmap", roadmapSchema);
