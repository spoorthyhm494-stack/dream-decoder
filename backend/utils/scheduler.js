// utils/scheduler.js
import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import Roadmap from "../models/Roadmap.js";
import User from "../models/User.js";
import { sendEmail } from "./emailService.js";
import { sendPush } from "./pushService.js";
import {  getRandomMotivation } from "./motivations.js";

/**
 * notifyUser
 * Sends email and push (if available) to a user with title & message.
 */
async function notifyUser(userId, title, message) {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    if (user.email) {
      sendEmail(user.email, title, message).catch(err => console.error("Email send error:", err));
    }
    if (user.pushSubscription) {
      sendPush(user.pushSubscription, { title, message }).catch(err => console.error("Push send error:", err));
    }
  } catch (err) {
    console.error("notifyUser error:", err);
  }
}


/**
 * scheduleReminder
 * Schedules a single reminder document (uses cron).
 * Now correctly schedules for a specific date and time.
 */
export const scheduleReminder = (reminderDoc) => {
  try {
    if (!reminderDoc || !reminderDoc.time) {
      console.warn("scheduleReminder: invalid reminder", reminderDoc && reminderDoc._id);
      return;
    }

    // FIX APPLIED HERE: Removed the extra 'new' keyword.
    const time = new Date(reminderDoc.time);
    
    // Extract time and date components
     const minutes = time.getUTCMinutes();  
    const hours = time.getUTCHours();      
    const dayOfMonth = time.getUTCDate();    
    const month = time.getUTCMonth() + 1;

    // Cron expression: minute hour day_of_month month day_of_week
    const cronExp = `${minutes} ${hours} ${dayOfMonth} ${month} *`; // * = any day of week

    const job = cron.schedule(cronExp, async () => {
      try {
        // Log before action to confirm job started
        console.log(`✅ Running scheduled job for reminder: ${reminderDoc._id}`);
          
        await notifyUser(reminderDoc.userId, reminderDoc.title, reminderDoc.message);

        // If one-time, STOP the cron job immediately after firing and delete.
        if (reminderDoc.repeat === "once") {
          job.stop(); // Stops the job from running again
          await Reminder.findByIdAndDelete(reminderDoc._id);
        }
      } catch (err) {
        console.error("Error executing scheduled reminder:", err);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata" 
    });

    console.log(`⏰ Scheduled reminder (${reminderDoc._id}) for ${time.toISOString()} with cron: ${cronExp}`);
  } catch (err) {
    console.error("scheduleReminder error:", err, reminderDoc);
  }
};

/**
 * createRoadmapReminders
 * Create Reminder docs for each step in a roadmap and schedule them immediately.
 * - userId: ObjectId
 * - steps: array of step objects (must include stepNumber, title, description)
 *
 * It spaces reminders one day apart by default; you can modify logic as needed.
 */
export const createRoadmapReminders = async (userId, steps = []) => {
  try {
    if (!userId || !Array.isArray(steps)) return;

    const created = [];
    const today = new Date();
    // start scheduling from tomorrow (so user has time today)
    let baseDate = new Date(today);
    baseDate.setHours(9, 0, 0, 0); // default at 9:00 AM India time
    baseDate.setDate(baseDate.getDate() + 1);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const reminderTime = new Date(baseDate);
      reminderTime.setDate(baseDate.getDate() + i); // i days after baseDate

      const reminder = await Reminder.create({
        userId,
        title: `Roadmap: ${step.title || `Step ${step.stepNumber || i+1}`}`,
        message: step.description || `Complete step ${step.stepNumber || i+1}`,
        time: reminderTime,
        type: "roadmap",
        repeat: "once",
        createdAt: new Date()
      });

      // schedule immediately
      scheduleReminder(reminder);
      created.push(reminder);
    }

    console.log(`📋 Created and scheduled ${created.length} roadmap reminders for user ${userId}`);
    return created;
  } catch (err) {
    console.error("createRoadmapReminders error:", err);
    throw err;
  }
};

/**
 * scheduleDailyRoadmapReminder
 * Runs daily at 09:00 and nudges users who have pending steps.
 */
export const scheduleDailyRoadmapReminder = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("📘 Running daily roadmap reminder job...");
      const roadmaps = await Roadmap.find({});
      for (const roadmap of roadmaps) {
        const user = await User.findById(roadmap.userId);
        if (!user) continue;

        const total = (roadmap.steps || []).length;
        const completed = (roadmap.steps || []).filter(s => s.completed).length;

        if (total === 0) continue;

        // If user hasn't completed today's target (naive: if not all completed)
        if (completed < total) {
          const pending = total - completed;
          const message = `You have ${pending} pending step(s) in "${roadmap.goal}". Try completing one today — small wins add up!`;
          await notifyUser(user._id, "Roadmap Reminder", message);
        }
      }
    } catch (err) {
      console.error("scheduleDailyRoadmapReminder error:", err);
    }
  }, { timezone: "Asia/Kolkata" });

  console.log("📘 Daily roadmap reminder scheduled (09:00 Asia/Kolkata)");
};

/**
 * scheduleDailyMotivation
 * Sends a short motivational message every morning at 07:00.
 */
export function scheduleDailyMotivation() {
  cron.schedule("0 9 * * *", async () => {
    const users = await User.find({});
    const message = getRandomMotivation();

    users.forEach(user => {
      if (user.pushSubscription) {
        sendPush(user.pushSubscription, {
          title: "Daily Motivation",
          message
        });
      }
      if (user.email) {
        sendEmail(user.email, "Daily Motivation", message);
      }
    });

    console.log("🌟 Daily Motivation Sent");
  }, { timezone: "Asia/Kolkata" });
}



/**
 * scheduleDailySmartReminder
 * Alias / existing function you used earlier — keep for backward compatibility.
 * We'll call the roadmap reminder function from here (or keep separate logic).
 */
export const scheduleDailySmartReminder = () => {
  // For backward compatibility, call scheduleDailyRoadmapReminder and scheduleDailyMotivation
  scheduleDailyRoadmapReminder();
  scheduleDailyMotivation();
  console.log("🤖 Daily smart reminder initialized");
};

/**
 * scheduleAutoDeleteReminders
 * Periodically clean up one-time reminders that are past due.
 */
export const scheduleAutoDeleteReminders = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const del = await Reminder.deleteMany({ time: { $lt: now }, repeat: "once" });
      if (del.deletedCount) {
        console.log(`🗑 Auto-deleted ${del.deletedCount} past reminders`);
      }
    } catch (err) {
      console.error("scheduleAutoDeleteReminders error:", err);
    }
  }, { timezone: "Asia/Kolkata" });

  console.log("🗑 Auto-delete old reminders job scheduled (hourly)");
};

/**
 * scheduleDailyStreakCheck
 * Resets streak or maintains it based on lastCompletionDate.
 */
export const scheduleDailyStreakCheck = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("🔁 Running daily streak consistency check...");
      const users = await User.find({});
      const today = new Date();
      today.setHours(0,0,0,0);

      for (const user of users) {
        if (!user.lastCompletionDate) continue;
        const last = new Date(user.lastCompletionDate);
        last.setHours(0,0,0,0);
        const diffDays = Math.floor((today - last) / (1000*60*60*24));
        if (diffDays >= 2) {
          user.streak = 0;
          await user.save();
          // optional: notify user
          await notifyUser(user._id, "Streak reset", "We noticed you missed a day — your streak has been reset. Start again today!");
        }
      }
    } catch (err) {
      console.error("scheduleDailyStreakCheck error:", err);
    }
  }, { timezone: "Asia/Kolkata" });

  console.log("🔁 Daily streak check scheduled (00:00 Asia/Kolkata)");
};
