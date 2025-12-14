import Reminder from "../models/Reminder.js";

export const createRoadmapReminders = async (userId, steps) => {
  try {
    const today = new Date();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      const reminderTime = new Date(today);
      reminderTime.setDate(today.getDate() + i);

      await Reminder.create({
        userId,
        title: `Complete Step ${step.stepNumber}: ${step.title}`,
        message: step.description || "You have a roadmap task pending",
        time: reminderTime,
        type: "roadmap",
        repeat: "once"
      });
    }

    console.log("📋 Roadmap reminders auto-created");
  } catch (err) {
    console.error("❌ Error creating roadmap reminders:", err);
  }
};
