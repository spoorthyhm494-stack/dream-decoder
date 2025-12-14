import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config(); // ✅ ensure .env loaded here

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error("❌ VAPID keys missing in .env");
}

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:admin@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const sendPush = async (subscription, payload) => {
    try {
        const response = await webpush.sendNotification(subscription, JSON.stringify(payload));
        

        console.log("📨 Push Sent successfully. Status:", response.statusCode);
        
    } catch (err) {

        console.error("❌ Push Notification Delivery Failed:", err.message);

        // Check for specific HTTP status codes that indicate a permanent failure
        if (err.statusCode) {
            console.error(`Status Code: ${err.statusCode}.`);

            if (err.statusCode === 410) {
                // 410 Gone: The subscription is expired (user revoked permission, or browser token expired).
                console.error(
                    "⚠️ Action Needed: Status 410 (Gone). This subscription should be DELETED from the User model."
                );
                // In production, you would add code here to remove the pushSubscription from the database.
            } else if (err.statusCode === 404) {
                // 404 Not Found: Similar to 410, usually means the subscription is bad.
                console.error(
                    "⚠️ Action Needed: Status 404 (Not Found). This subscription should be DELETED from the User model."
                );
            } else if (err.statusCode >= 500) {
                // Server-side errors (e.g., Push service is down)
                console.error("🚨 Server Error: Push service provider is likely having issues.");
            }
        }
        
        
        if (err.body) {
            console.error("Detailed Push Error Response Body:", err.body);
        }
        throw err; 
    }
};
