export enum Role {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  imageDataUrl?: string;
}
