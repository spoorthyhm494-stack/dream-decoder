import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import Roadmap from "../models/roadmap.js";
import User from "../models/User.js";
import { sendEmail } from "./emailService.js";
import { sendPush } from "./pushService.js";
import { getRandomMotivation } from "./motivations.js";

/**
 * notifyUser
 * Sends email and push (if available) to a user with title & message.
 */
async function notifyUser(userId, title, message) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (user.email) {
      // ✅ Await here ensures the email process completes
      await sendEmail(user.email, title, message);
      console.log(`📧 Email sent successfully to: ${user.email}`);
    }

    if (user.pushSubscription) {
      await sendPush(user.pushSubscription, { title, message }).catch(err => 
        console.error("Push send error:", err)
      );
    }
  } catch (err) {
    console.error("notifyUser error:", err);
  }
}

/**
 * scheduleReminder
 * Schedules a single reminder or future message.
 */
export const scheduleReminder = (reminderDoc) => {
  try {
    if (!reminderDoc || !reminderDoc.time) return;

    const time = new Date(reminderDoc.time);
    
    // Using local getters since timezone is set to Asia/Kolkata
    const minutes = time.getMinutes();  
    const hours = time.getHours();      
    const dayOfMonth = time.getDate();   
    const month = time.getMonth() + 1;

    const cronExp = `${minutes} ${hours} ${dayOfMonth} ${month} *`;

    const job = cron.schedule(cronExp, async () => {
      try {
        console.log(`✅ Running job: ${reminderDoc._id}`);
          
        await notifyUser(reminderDoc.userId, reminderDoc.title, reminderDoc.message);

        if (reminderDoc.repeat === "once") {
          job.stop();
          // Silently handle if the doc is from a different collection (like FutureMessages)
          await Reminder.findByIdAndDelete(reminderDoc._id).catch(() => {});
        }
      } catch (err) {
        console.error("Error executing scheduled reminder:", err);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata" 
    });

    console.log(`⏰ Scheduled for IST: ${hours}:${minutes} on ${dayOfMonth}/${month} (ID: ${reminderDoc._id})`);
  } catch (err) {
    console.error("scheduleReminder error:", err);
  }
};

/**
 * createRoadmapReminders
 */
export const createRoadmapReminders = async (userId, steps = []) => {
  try {
    if (!userId || !Array.isArray(steps)) return;

    const created = [];
    const today = new Date();
    let baseDate = new Date(today);
    baseDate.setHours(9, 0, 0, 0); 
    baseDate.setDate(baseDate.getDate() + 1);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const reminderTime = new Date(baseDate);
      reminderTime.setDate(baseDate.getDate() + i); 

      const reminder = await Reminder.create({
        userId,
        title: `Roadmap: ${step.title || `Step ${step.stepNumber || i+1}`}`,
        message: step.description || `Complete step ${step.stepNumber || i+1}`,
        time: reminderTime,
        type: "roadmap",
        repeat: "once",
        createdAt: new Date()
      });

      scheduleReminder(reminder);
      created.push(reminder);
    }
    return created;
  } catch (err) {
    console.error("createRoadmapReminders error:", err);
    throw err;
  }
};

/**
 * scheduleDailyRoadmapReminder (09:00 IST)
 */
export const scheduleDailyRoadmapReminder = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      const roadmaps = await Roadmap.find({});
      for (const roadmap of roadmaps) {
        const user = await User.findById(roadmap.userId);
        if (!user) continue;

        const total = (roadmap.steps || []).length;
        const completed = (roadmap.steps || []).filter(s => s.completed).length;

        if (completed < total) {
          const pending = total - completed;
          const message = `You have ${pending} pending step(s) in "${roadmap.goal}". Small wins add up!`;
          await notifyUser(user._id, "Roadmap Reminder", message);
        }
      }
    } catch (err) {
      console.error("scheduleDailyRoadmapReminder error:", err);
    }
  }, { timezone: "Asia/Kolkata" });
};

/**
 * scheduleDailyMotivation (09:00 IST)
 */
export function scheduleDailyMotivation() {
  cron.schedule("0 9 * * *", async () => {
    const users = await User.find({});
    const message = getRandomMotivation();

    for (const user of users) {
      await notifyUser(user._id, "Daily Motivation", message);
    }
    console.log("🌟 Daily Motivation Sent");
  }, { timezone: "Asia/Kolkata" });
}

export const scheduleDailySmartReminder = () => {
  scheduleDailyRoadmapReminder();
  scheduleDailyMotivation();
  console.log("🤖 Daily smart reminder initialized");
};

export const scheduleAutoDeleteReminders = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      await Reminder.deleteMany({ time: { $lt: now }, repeat: "once" });
    } catch (err) {
      console.error("Auto-delete error:", err);
    }
  }, { timezone: "Asia/Kolkata" });
};

export const scheduleDailyStreakCheck = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
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
          await notifyUser(user._id, "Streak reset", "Your streak has been reset. Start again today!");
        }
      }
    } catch (err) {
      console.error("Streak check error:", err);
    }
  }, { timezone: "Asia/Kolkata" });
};
