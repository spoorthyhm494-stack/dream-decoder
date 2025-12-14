import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  goal: {
    type: String,
    required: true,
  },

  completedPercentage: {
    type: Number,
    default: 0,
  },

  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;