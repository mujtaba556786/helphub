
import { GoogleGenAI } from "@google/genai";

export const getMarketplaceInsights = async (stats: any, users: any[], bookings: any[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are an expert marketplace analyst. Analyze the following marketplace data and provide 3 key insights or recommendations for the admin.
      Statistics: ${JSON.stringify(stats)}
      User Count: ${users.length}
      Pending Bookings: ${bookings.filter(b => b.status === 'Pending').length}
      Return the response in a clear, professional tone with bullet points.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate insights at this time.";
  }
};

export const getTrafficInsights = async (stats: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Analyze these traffic performance metrics for my service marketplace app:
      - Total Impressions: ${stats.adImpressions}
      - Total Interactions/Clicks: ${stats.adClicks}
      
      Suggest 3 specific ways to increase platform reach and user engagement. Focus on placement and targeting specific service categories like Home or Care.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "AI insights currently unavailable for performance analysis.";
  }
}

export const suggestServiceDescription = async (serviceName: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a compelling 2-sentence marketing description for a service called "${serviceName}" in a professional service marketplace.`,
      });
      return response.text;
    } catch (error) {
      return "Expert service for all your needs.";
    }
}
