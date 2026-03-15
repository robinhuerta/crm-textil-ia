import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// LEER API KEY MANUALMENTE
let apiKey = "AIzaSyCpGHZ-voBNl31s-kb37krr56KiJk2j60E"; // Tomada de .env.local

const OUTPUT_FILE = path.join(__dirname, '../public/audio/commercial_lamachi.mp3');
const TEXT = "Atención barrio. ¿Buscando el punto exacto del sabor? Tu destino es Cevichería La Machi. Donde el pescado salta del mar a tu mesa. Gracias al maestro Arturo Condori Nolazco por ponerle sazón al barrio. Encuéntranos en el Mercado Las Malvinas del Sur, aquí en Valdiviezo, Ate. Cevichería La Machi... auspiciador oficial de La Nueva cinco cuarenta radio.";
const VOICE_NAME = "Kore";

async function generateAudio() {
    console.log(`🎙️ Generando audio para: "${TEXT}"`);
    console.log(`🔑 Usando API Key: ${apiKey.substring(0, 5)}...`);

    const client = new GoogleGenAI({ apiKey: apiKey });

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{
                role: 'user',
                parts: [{ text: `Generate speech for: "${TEXT}"` }]
            }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } }
                }
            }
        });

        const audioData = response?.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!audioData) {
            console.error("❌ No se recibió data de audio de la API.");
            return;
        }

        const buffer = Buffer.from(audioData, 'base64');

        // Asegurar que el directorio existe
        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, buffer);
        console.log(`✅ Audio guardado en: ${OUTPUT_FILE}`);

    } catch (error) {
        console.error("❌ Error generando audio:", error);
    }
}

generateAudio();
