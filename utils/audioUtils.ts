/**
 * Utilidades de audio compartidas para el proyecto La Nueva 5:40
 */

/**
 * Decodifica datos de audio PCM raw a un AudioBuffer
 * @param data - Datos de audio en formato Uint8Array
 * @param ctx - AudioContext para crear el buffer
 * @param sampleRate - Tasa de muestreo (ej: 24000)
 * @param numChannels - Número de canales (1 para mono, 2 para estéreo)
 * @returns Promise<AudioBuffer> - Buffer de audio decodificado
 */
export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }

    return buffer;
}

/**
 * Codifica un Uint8Array a base64
 * @param bytes - Datos a codificar
 * @returns string - Cadena base64
 */
export function encodeToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Decodifica una cadena base64 a Uint8Array
 * @param base64 - Cadena base64 a decodificar
 * @returns Uint8Array - Datos decodificados
 */
export function decodeFromBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
