// models/Decoder.js
import mongoose from "mongoose";

const decoderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  dreamText: { type: String, required: true },
  interpretation: { type: String },
  meta: {
    tags: [String],
    mood: String
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Decoder", decoderSchema);
