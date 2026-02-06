
import { GoogleGenAI } from "@google/genai";

export const getGeminiResponse = async (userInput: string) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "") {
    console.warn("API_KEY ausente.");
    return "¡Habla barrio! Vincula tu API Key en el Plan Maestro para que pueda responderte.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: userInput }] }],
      config: {
        systemInstruction: "Eres el asistente DJ de 'La Nueva 5:40 Radio'. Hablas como un locutor peruano carismático y con jerga local. Responde brevemente (máx 20 palabras).",
        temperature: 0.8,
      },
    });

    return response.text || "¡Fuego! Me perdí un toque la señal. ¡Repite porfa!";
  } catch (error) {
    console.error("Error DJ Chat:", error);
    return "Habla barrio, se me cruzó la antena. ¡Vuelve a intentar causa!";
  }
};
