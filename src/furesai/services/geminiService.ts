import { GoogleGenAI, Chat, Session, LiveServerMessage, Modality, Blob, GenerateContentResponse } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';

declare const process: { env: Record<string, string | undefined> };

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;

function getChatSession(): Chat {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            },
        });
    }
    return chat;
}

export async function sendTextMessage(message: string): Promise<GenerateContentResponse> {
    const chatSession = getChatSession();
    const result = await chatSession.sendMessage({ message });
    return result;
}

export async function connectLiveSession(
    callbacks: {
        onOpen: () => void;
        onMessage: (message: LiveServerMessage) => void;
        onError: (e: ErrorEvent) => void;
        onClose: (e: CloseEvent) => void;
    }
): Promise<Session> {
    return await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: callbacks.onOpen,
            onmessage: callbacks.onMessage,
            onerror: callbacks.onError,
            onclose: callbacks.onClose,
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: SYSTEM_INSTRUCTION,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });
}


// AUDIO UTILITY FUNCTIONS

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
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


export function createPcmBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export async function generateImage(prompt: string): Promise<{ base64Image: string; mimeType: string; description?: string }> {
  const response = await (ai as unknown as any).models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  const candidate = response.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];

  let imageData: { data: string; mimeType?: string } | undefined;
  const descriptionTexts: string[] = [];

  for (const part of parts) {
    if ('inlineData' in part && part.inlineData) {
      imageData = part.inlineData;
    }
    if ('text' in part && part.text) {
      descriptionTexts.push(part.text);
    }
  }

  if (!imageData) {
    throw new Error('No image data returned from Gemini');
  }

  return {
    base64Image: imageData.data,
    mimeType: imageData.mimeType ?? 'image/png',
    description: descriptionTexts.join('\n').trim(),
  };
}
