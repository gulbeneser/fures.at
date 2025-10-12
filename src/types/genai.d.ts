declare module '@google/genai' {
  export interface Blob {
    data: string;
    mimeType: string;
  }

  export type GenerateContentResponse = any;
  export type LiveServerMessage = any;
  export type Session = any;

  export interface Chat {
    sendMessage(payload: unknown): Promise<GenerateContentResponse>;
    sendRealtimeInput?: (payload: unknown) => Promise<unknown>;
  }

  export const Modality: Record<string, string>;

  export class GoogleGenAI {
    constructor(config: Record<string, unknown>);
    chats: {
      create(config: Record<string, unknown>): Chat;
    };
    live: {
      connect(config: Record<string, unknown>): Promise<Session>;
    };
  }
}
