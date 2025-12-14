// motivations.js

export const motivationalLines = [
  "🔥 You're improving — keep going!",
  "🌟 Small steps create big changes!",
  "💪 You’re closer than you think!",
  "🚀 Believe in yourself — your journey matters!",
  "✨ One task at a time. You're doing great!",
  "🌱 Growth happens slowly, but surely.",
  "🏆 You are unstoppable — keep moving forward!",
];

export function getRandomMotivation() {
  const index = Math.floor(Math.random() * motivationalLines.length);
  return motivations[Math.floor(Math.random() * motivations.length)];
};
