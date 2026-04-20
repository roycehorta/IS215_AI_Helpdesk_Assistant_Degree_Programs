// frontend\src\types\chat.ts
export type Sender = 'user' | 'bot';

export interface Message {
  text: string;
  sender: Sender;
  timestamp?: number;
}

