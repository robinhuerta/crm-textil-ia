import { GoogleGenAI, Modality } from "@google/genai";

// Simple fast hash for cache keys
const simpleHash = (uniqueString: string) => {
    let hash = 0;
    for (let i = 0; i < uniqueString.length; i++) {
        const char = uniqueString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash &= hash;
    }
    return new Uint32Array([hash])[0].toString(36);
};

// Función reutilizable para generar audio con Gemini TTS
export async function generateGeminiSpeech(
    text: string,
    voiceName: 'Kore' | 'Puck' | 'Charon' | 'Aoede' = 'Kore',
    apiKey?: string
): Promise<string | undefined> {
    const key = apiKey || process.env.API_KEY;
    if (!key) {
        console.warn('API_KEY no configurada para Gemini TTS');
        return undefined;
    }

    // 1. Check Cache (localStorage)
    const cacheKey = `tts_${simpleHash(text + voiceName)}`;
    const cachedAudio = localStorage.getItem(cacheKey);
    if (cachedAudio) {
        console.log('⚡ [Gemini TTS] Cache Hit!');
        return cachedAudio;
    }

    try {
        console.log('⏳ [Gemini TTS] Generating new audio...');
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            },
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        // 2. Save to Cache
        if (audioData) {
            try {
                // Limit cache size: Remove old generic items if full
                localStorage.setItem(cacheKey, audioData);
            } catch (e) {
                console.warn('Cache full, clearing old TTS entries...');
                // Simple strategy: Clear all TTS entries if full
                Object.keys(localStorage).forEach(k => {
                    if (k.startsWith('tts_')) localStorage.removeItem(k);
                });
                try {
                    localStorage.setItem(cacheKey, audioData);
                } catch (e2) {
                    console.error('Failed to cache TTS even after clear');
                }
            }
        }

        return audioData;
    } catch (error) {
        console.error('[Gemini TTS] Error generating speech:', error);
        return undefined;
    }
}

// Decodificar audio PCM de Gemini (24kHz, mono)
export async function decodeGeminiAudio(
    base64Audio: string,
    audioContext: AudioContext
): Promise<AudioBuffer | null> {
    try {
        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        // Usar Int16Array directo del buffer (CORRECTO)
        const dataInt16 = new Int16Array(bytes.buffer);
        const sampleRate = 24000;
        const numChannels = 1;
        const frameCount = dataInt16.length / numChannels;

        const audioBuffer = audioContext.createBuffer(numChannels, frameCount, sampleRate);

        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
            }
        }

        return audioBuffer;
    } catch (error) {
        console.error('[Gemini Audio] Error decoding audio:', error);
        return null;
    }
}

// Reproducir audio con control de volumen de la radio
export function playGeminiAudio(
    audioBuffer: AudioBuffer,
    audioContext: AudioContext,
    onStart?: () => void,
    onEnd?: () => void
): AudioBufferSourceNode {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = 1.08; // Velocidad 8% más rápida
    source.connect(audioContext.destination);

    source.onended = () => {
        onEnd?.();
        // Restaurar volumen de la radio
        window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.8 } }));
    };

    // Bajar volumen de la radio
    window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.1 } }));
    onStart?.();
    source.start(0);

    return source;
}
