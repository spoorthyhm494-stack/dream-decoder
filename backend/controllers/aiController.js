// controllers/aiController.js
const rawOutput = aiResponse.data.choices[0].message.content;

// 🔥 Extract JSON using regex (most reliable)
const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);

if (!jsonMatch) {
  console.error("AI INVALID OUTPUT:", rawOutput);
  return res.status(500).json({ message: "AI returned invalid JSON" });
}

const cleaned = jsonMatch[0]; // This is the exact JSON { ... }

let roadmapJSON;
try {
  roadmapJSON = JSON.parse(cleaned);
} catch (err) {
  console.error("JSON PARSE ERROR:", cleaned);
  return res.status(500).json({ message: "AI returned invalid JSON" });
}

/* ============================================================
   1️⃣ EMOTION DETECTION
============================================================ */
function detectEmotion(text) {
  const t = text.toLowerCase();

  if (t.includes("fear") || t.includes("scared") || t.includes("afraid"))
    return "Fear / Anxiety";

  if (t.includes("happy") || t.includes("joy") || t.includes("excited"))
    return "Happiness / Joy";

  if (t.includes("sad") || t.includes("cry") || t.includes("upset"))
    return "Sadness";

  if (t.includes("angry") || t.includes("anger"))
    return "Anger / Frustration";

  if (t.includes("love") || t.includes("care"))
    return "Love / Attachment";

  if (t.includes("stress") || t.includes("pressure"))
    return "Stress / Overthinking";

  if (t.includes("lost") || t.includes("confused"))
    return "Confusion / Uncertainty";

  if (t.includes("success") || t.includes("achievement"))
    return "Ambition / Motivation";

  return "Neutral / Hidden Emotion";
}


/* ============================================================
   2️⃣ DREAM CATEGORIES
============================================================ */
function detectCategory(text) {
  const t = text.toLowerCase();

  if (t.includes("falling") || t.includes("fell"))
    return "Falling Dream";

  if (t.includes("running") || t.includes("chasing") || t.includes("someone behind me"))
    return "Being Chased / Running Dream";

  if (t.includes("exams") || t.includes("test") || t.includes("school"))
    return "Exam / Academic Stress Dream";

  if (t.includes("ghost") || t.includes("spirit") || t.includes("demon"))
    return "Ghost / Supernatural Dream";

  if (t.includes("water") || t.includes("ocean") || t.includes("drowning"))
    return "Water / Drowning Dream";

  if (t.includes("flying") || t.includes("float"))
    return "Flying Dream";

  if (t.includes("death") || t.includes("dead") || t.includes("dying"))
    return "Death Dream";

  if (t.includes("snake") || t.includes("animal") || t.includes("bite"))
    return "Animals / Snake Dream";

  if (t.includes("accident") || t.includes("crash"))
    return "Accident Dream";

  return "General / Unclassified Dream";
}


/* ============================================================
   3️⃣ MEANING BASED ON CATEGORY
============================================================ */
function categoryMeaning(category) {
  switch (category) {
    case "Falling Dream":
      return "Falling dreams represent loss of control, insecurity, or fear of failure.";

    case "Being Chased / Running Dream":
      return "You're avoiding something in real life—stress, responsibility or conflict.";

    case "Exam / Academic Stress Dream":
      return "You feel pressure to perform or fear disappointing someone.";

    case "Ghost / Supernatural Dream":
      return "You might be carrying emotional baggage or unresolved fear.";

    case "Water / Drowning Dream":
      return "You feel overwhelmed by emotions or responsibilities.";

    case "Flying Dream":
      return "Flying shows freedom, confidence, and desire to escape limitations.";

    case "Death Dream":
      return "Death dreams symbolize transformation, new beginnings, or major life change.";

    case "Animals / Snake Dream":
      return "Snakes or animals represent hidden threats, fear, or suppressed emotions.";

    case "Accident Dream":
      return "You fear losing control or making a serious mistake in life.";

    default:
      return "Your dream reflects subconscious thoughts and emotions.";
  }
}


/* ============================================================
   4️⃣ SUGGESTIONS BASED ON CATEGORY
============================================================ */
function categorySuggestions(category) {
  switch (category) {
    case "Falling Dream":
      return ["Focus on grounding yourself with routine.", "Avoid overthinking future failures.", "Start one task at a time."];

    case "Being Chased / Running Dream":
      return ["Face issues instead of avoiding them.", "Talk to someone if you feel pressured.", "Try to reduce stress triggers."];

    case "Exam / Academic Stress Dream":
      return ["Break tasks into smaller parts.", "Practice time management.", "Avoid comparing yourself with others."];

    case "Ghost / Supernatural Dream":
      return ["Let go of past fears gradually.", "Do relaxing activities before sleeping.", "Talk about fears with someone you trust."];

    case "Water / Drowning Dream":
      return ["Practice emotional control.", "Take breaks when overwhelmed.", "Don’t bottle up feelings."];

    case "Flying Dream":
      return ["Use your confidence to explore new opportunities.", "Set bigger goals.", "Trust your decisions."];

    case "Death Dream":
      return ["Accept changes in your life.", "Let go of old habits.", "Focus on building a new routine."];

    case "Animals / Snake Dream":
      return ["Be cautious with people around you.", "Identify what is making you insecure.", "Trust your instincts."];

    case "Accident Dream":
      return ["Slow down decision-making.", "Avoid taking unnecessary risks.", "Think before acting."];

    default:
      return ["Maintain a dream journal.", "Observe repeating patterns.", "Practice stress reduction techniques."];
  }
}


/* ============================================================
   5️⃣ MAIN DREAM ANALYZER
============================================================ */
export const analyzeDream = async (req, res) => {
  try {
    const { dreamText } = req.body;

    if (!dreamText) {
      return res.status(400).json({ message: "Dream text is required" });
    }

    const emotion = detectEmotion(dreamText);
    const category = detectCategory(dreamText);
    const meaning = categoryMeaning(category);
    const suggestions = categorySuggestions(category);

    return res.status(200).json({
      dream: dreamText,
      emotion,
      category,
      meaning,
      suggestions
    });

  } catch (error) {
    return res.status(500).json({ error: "Dream analysis failed", details: error });
  }
};


/* ============================================================
   6️⃣ ROADMAP GENERATOR (your earlier code intact)
============================================================ */
export const generateRoadmap = async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ message: "Domain is required" });
    }

    const roadmap = [
      { step: 1, title: `Basics of ${domain}`, details: `Start with the fundamentals of ${domain}.` },
      { step: 2, title: `Core Concepts`, details: `Learn the important concepts used in ${domain}.` },
      { step: 3, title: `Beginner Projects`, details: `Build simple projects to strengthen your skills.` },
      { step: 4, title: `Advanced Topics`, details: `Move to advanced and real-world concepts.` },
      { step: 5, title: `Career Prep`, details: `Prepare for jobs or internships in ${domain}.` }
    ];

    res.status(200).json({ roadmap });

  } catch (error) {
    res.status(500).json({ message: "Error generating roadmap", error });
  }
};

