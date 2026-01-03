
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getAIInsights = async (disasters: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these disaster reports and provide a 2-sentence situational briefing for emergency response teams. Focus on urgency and resource allocation priorities.
      Data: ${JSON.stringify(disasters)}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Briefing Error:", error);
    return "Failed to generate AI insights. Please monitor live feeds manually.";
  }
};

export const evaluateDisasterSeverity = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rate the severity of this disaster report as 'Low', 'Medium', 'High', or 'Critical' based on the text: "${description}". Reply with only the single word rating.`,
    });
    return response.text.trim();
  } catch (error) {
    return "Medium"; // Default fallback
  }
};
