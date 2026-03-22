
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
      model: 'gemini-1.5-flash',
      contents: [{ parts: [{ text: userInput }] }],
      config: {
        systemInstruction: "Eres el asistente DJ de 'La Nueva cinco cuarenta radio'. Hablas como un locutor peruano carismático y con jerga local. Responde brevemente (máx 20 palabras).",
        temperature: 0.8,
      },
    });

    return response.text || "¡Fuego! Me perdí un toque la señal. ¡Repite porfa!";
  } catch (error) {
    console.error("Error DJ Chat:", error);
    return "Habla barrio, se me cruzó la antena. ¡Vuelve a intentar causa!";
  }
};


// Transforma un saludo simple en uno digno de radio profesional
export const professionalizeGreeting = async (from: string, to: string, message?: string): Promise<string> => {
  const apiKey = process.env.API_KEY;

  // Texto fallback si no hay IA
  const fallback = message
    ? `¡Tenemos un saludo! Para ${to}, de parte de ${from}. ${message}. ¡Un abrazo grande!`
    : `¡Tenemos un saludo! Para ${to}, de parte de ${from}. ¡Un abrazo grande!`;

  // Si no hay API key, usar texto base
  if (!apiKey || apiKey.trim() === '') {
    console.warn('[DJ AI] Sin API Key - usando texto base');
    return fallback;
  }

  try {
    console.log('[DJ AI] Mejorando saludo con Gemini...');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ parts: [{ text: `De ${from} para ${to}${message ? ': "' + message + '"' : '.'}` }] }],
      config: {
        systemInstruction: `Eres el DJ Estrella de "La Nueva cinco cuarenta radio", la radio más popular del Perú. ¡Tienes muchísima chispa y energía!
Tu especialidad es la IMPROVISACIÓN total con sabor nacional. No repitas frases aburridas.

REGLAS DE ORO:
1. EL MENSAJE ES SAGRADO: El saludo del usuario ("${message || ''}") DEBE ser el corazón del anuncio. Transfórmalo, grítalo, emocionate con él, pero NUNCA lo quites.
2. USA JERGA PERUANA CON TODO: "Habla batería", "Fuego causita", "Gente bonita", "Oe mi broder", "Chibolos y chibolitas", "PeAches", "Al toque", "Sabor", "¡Qué rico!", "¡De todas maneras!".
3. AMBIENTE DE RADIO EN VIVO: Usa frases como "¡En sintonía total!", "¡A pedido del público!", "¡Quemando la señal!", "¡Sube, sube!", "¡No te lo pierdas!", "¡La radio que te mueve!".
4. DETALLE CREATIVO: Inventa algo breve sobre el momento ("mientras se toma una gaseosita helada", "chambeando duro pero con la radio", "en pleno tráfico bailando").
5. OBLIGATORIO: Nombra a "La Nueva cinco cuarenta radio" con mucha fuerza.

- Extensión: De 4 a 6 oraciones cortas y explosivas.
- Responde SOLO con el anuncio, sin comillas. ¡Sé el alma de la fiesta!`,
        temperature: 1.2,
        maxOutputTokens: 400,
      },
    });

    const enhanced = response.text?.trim();
    if (enhanced && enhanced.length > 20) {
      console.log('[DJ AI] Saludo mejorado OK:', enhanced);
      return enhanced;
    }
    console.warn('[DJ AI] Respuesta sospechosa, usando fallback');
    return message
      ? `¡Atención barrio! Un saludo especial para ${to}, de parte de ${from}. ${message}. ¡Pásenla bacán en sintonía de La Nueva cinco cuarenta radio!`
      : `¡Atención barrio! Un saludo especial para ${to}, de parte de ${from}. ¡Pásenla bacán en sintonía de La Nueva cinco cuarenta radio!`;
  } catch (error: any) {
    console.error('[DJ AI] Error CRÍTICO:', error?.message || error);
    return message
      ? `¡Habla gentita! Aquí ${from} le manda un saludazo a ${to}. ${message}. ¡Que siga el vacilón en La Nueva cinco cuarenta radio!`
      : `¡Habla gentita! Aquí ${from} le manda un saludazo a ${to}. ¡Que siga el vacilón en La Nueva cinco cuarenta radio!`;
  }
};

// Genera un segmento radial de farándula a partir de titulares de noticias
export const generateFarandulaSegment = async (headlines: string[]): Promise<string> => {
  const apiKey = process.env.API_KEY;
  const fallback = `¡Buenos días gente bonita! Aquí en La Nueva cinco cuarenta radio te traemos lo último del espectáculo. ¡El mundo de la farándula no para y nosotros tampoco! Sigue con nosotros para más novedades.`;

  if (!apiKey || apiKey.trim() === '') return fallback;
  if (!headlines.length) return fallback;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const headlinesText = headlines.map((h, i) => `${i + 1}. ${h}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ parts: [{ text: headlinesText }] }],
      config: {
        systemInstruction: `Eres el DJ de "La Nueva cinco cuarenta radio" con la sección de FARÁNDULA Y ESPECTÁCULOS. Con estos titulares de noticias reales de hoy, crea un segmento radial divertido al estilo locutor peruano.

REGLAS:
1. Máximo 5 oraciones en total. Breve pero impactante.
2. Usa jerga peruana: "¡Fuego causa!", "¡Habla barrio!", "¡Oe oe!", "¡Al toque!".
3. Menciona 2 o 3 de las noticias de forma natural, como si fuera chisme.
4. Empieza siempre con "¡Buenos días gente bonita de La Nueva cinco cuarenta radio! Aquí el chisme del espectáculo de hoy..."
5. Termina con "¡Y eso es todo el chisme de hoy! Sigue con nosotros en La Nueva cinco cuarenta radio."
6. Responde SOLO con el texto radial, sin títulos ni comillas extra.`,
        temperature: 1.1,
        maxOutputTokens: 350,
      },
    });

    const result = response.text?.trim();
    return result && result.length > 30 ? result : fallback;
  } catch (e) {
    console.error('[Farándula] Error Gemini:', e);
    return fallback;
  }
};

