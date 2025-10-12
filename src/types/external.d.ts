declare module '@google/genai' {
  export type LiveServerMessage = any;
  export interface Session {
    close: () => void;
    sendRealtimeInput: (input: unknown) => Promise<void> | void;
  }
  export interface Chat {
    sendMessage: (input: unknown) => Promise<any>;
  }
  export interface Blob {
    data: string;
    mimeType: string;
  }
  export type GenerateContentResponse = any;
  export interface GoogleGenAIOptions {
    apiKey: string;
  }
  export interface ChatCreateOptions {
    model: string;
    config?: Record<string, unknown>;
  }
  export interface LiveConnectOptions {
    model: string;
    callbacks?: {
      onopen?: () => void;
      onmessage?: (message: LiveServerMessage) => void;
      onerror?: (event: ErrorEvent) => void;
      onclose?: (event: CloseEvent) => void;
    };
    config?: Record<string, unknown>;
  }
  export const Modality: {
    readonly AUDIO: 'AUDIO';
    readonly TEXT: 'TEXT';
    [key: string]: string;
  };
  export class GoogleGenAI {
    constructor(options: GoogleGenAIOptions);
    chats: {
      create: (options: ChatCreateOptions) => Chat;
    };
    live: {
      connect: (options: LiveConnectOptions) => Promise<Session>;
    };
  }
}
