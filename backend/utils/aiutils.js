import axios from "axios";

export const runAI = async (prompt) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "Dream App"
        }
      }
    );
   const output = response.data.choices?.[0]?.message?.content;

    return output?.trim() || "No response received from model.";
  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);
    throw new Error("AI request failed");
  }
};
  
