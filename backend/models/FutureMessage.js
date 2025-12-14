import mongoose from "mongoose";

const futureMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  unlockDate: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  opened: {
    type: Boolean,
    default: false,
  }
});

const FutureMessage = mongoose.model("FutureMessage", futureMessageSchema);
export default FutureMessage;