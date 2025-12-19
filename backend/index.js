import dotenv from "dotenv";
dotenv.config(); // ✅ Must load first

import express from "express";
import cors from "cors";
import connectDB from "./db/connection.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import dreamNoteRoutes from "./routes/dreamNoteRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import decoderRoutes from "./routes/decoderRoutes.js";
import futureMessageRoutes from "./routes/futureMessageRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";

// Auth middleware
import { protect } from "./utils/authMiddleware.js";

// Scheduler functions  ✅ UPDATED
import { 
  scheduleReminder,
  scheduleDailySmartReminder,
  scheduleDailyMotivation,       // ✅ ADDED
  scheduleDailyRoadmapReminder,  // ✅ ADDED
  scheduleAutoDeleteReminders
} from "./utils/scheduler.js";

import Reminder from "./models/Reminder.js";

const app = express();

// ---------------------- CONNECT DB ----------------------
connectDB();

// ---------------------- MIDDLEWARE ----------------------
app.use(cors());
app.use(express.json());

// ---------------------- PUBLIC ROUTES ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

// ---------------------- PROTECTED ROUTES ----------------------
app.use("/api/dream", protect, dreamNoteRoutes);
app.use("/api/decoder", protect, decoderRoutes);
app.use("/api/roadmap", protect, roadmapRoutes);
app.use("/api/progress", protect, progressRoutes);
app.use("/api/future-messages", protect, futureMessageRoutes);
app.use("/api/reminders", protect, reminderRoutes);

// ---------------------- ROOT ----------------------
app.get("/", (req, res) => res.send("API is running..."));
app.get("/ping", (req, res) => {
  res.status(200).send("Server is awake");
});
// ---------------------- 404 & GLOBAL ERROR HANDLER ----------------------
app.use((req, res) => res.status(404).json({ message: "Endpoint not found" }));
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ---------------------- START SERVER ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // ----------------------
  // RUN ALL CRON JOBS
  // ----------------------
  scheduleDailySmartReminder();      // Existing
  scheduleDailyMotivation();         // ✅ New Daily Motivation
  scheduleDailyRoadmapReminder();    // ✅ New Roadmap Reminder
  scheduleAutoDeleteReminders();     // Clean database

  // ----------------------
  // Schedule existing reminders from DB
  // ----------------------
  try {
    const reminders = await Reminder.find({});
    reminders.forEach(reminder => scheduleReminder(reminder));
    console.log(`🔔 Scheduled ${reminders.length} existing reminders`);
  } catch (err) {
    console.error("Error scheduling existing reminders:", err);
  }
});


