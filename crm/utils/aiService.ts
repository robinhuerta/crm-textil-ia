import { GoogleGenAI } from "@google/genai";

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

export const extractLeadFromText = async (text: string) => {
  if (!API_KEY) throw new Error("Falta la API Key de Gemini");

  const ai = genAI as any;
  const model = "gemini-1.5-flash";

  const prompt = `
    Actúa como un experto en ventas de maquinaria textil. 
    Analiza la siguiente nota desordenada y extrae la información en un formato JSON estructurado para un CRM.
    
    Nota: "${text}"

    Debes devolver un JSON con esta estructura exacta:
    {
      "name": "Nombre de la persona",
      "role": "Cargo (ejem: Gerente de Planta, Dueño, Mecánico)",
      "company": "Nombre de la empresa textil",
      "email": "Email detectado o null",
      "phone": "Teléfono detectado o null",
      "machineryInterests": ["Lista de máquinas o repuestos mencionados"],
      "summary": "Resumen profesional de la visita/nota",
      "nextSteps": ["Lista de acciones comerciales a seguir"],
      "priority": "high | medium | low"
    }

    Considera marcas textiles como: Stoll, Mayer & Cie, Picanol, Terrot, Rieter, Shima Seiki, Groz-Beckert.
    Si no encuentras algún campo, pon null.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }]
    });
    const content = response.candidates[0].content.parts[0].text;
    const jsonString = content.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error en extracción IA:", error);
    throw error;
  }
};

export const extractLeadFromImage = async (base64Image: string) => {
  if (!API_KEY) throw new Error("Falta la API Key de Gemini");

  const ai = genAI as any;
  const model = "gemini-1.5-flash";

  const prompt = `
    Analiza esta imagen (probablemente una tarjeta de presentación o una máquina textil).
    Extrae la información de contacto y detalles técnicos relevantes en un formato JSON:
    {
      "name": "...",
      "role": "...",
      "company": "...",
      "email": "...",
      "phone": "...",
      "machineryDetails": "Detalles sobre la máquina si es visible",
      "suggestedAction": "Qué debería hacer el vendedor a continuación"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image.split(",")[1] || base64Image,
                mimeType: "image/jpeg"
              }
            }
          ]
        }
      ]
    });
    const content = response.candidates[0].content.parts[0].text;
    const jsonString = content.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error en OCR IA:", error);
    throw error;
  }
};
