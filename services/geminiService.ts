import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Fallback if no key is provided, so the UI doesn't crash in demo mode
const isMockMode = !apiKey;

export const generatePartyHype = async (baseDescription: string, vibe: string): Promise<string> => {
  if (isMockMode) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`(AI Generated) Get ready for the ultimate ${vibe} experience! ${baseDescription} - it's going to be legendary! 🚀🔥`);
      }, 1000);
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, high-energy, slang-filled (Gen Z style) party description based on this: "${baseDescription}". The vibe is ${vibe}. Keep it under 30 words. Use emojis.`,
    });
    return response.text || "Let's party!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ready to rage! Join us.";
  }
};