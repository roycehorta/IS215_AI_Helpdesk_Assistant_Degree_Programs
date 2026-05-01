// frontend/src/lib/chat-storage.ts

export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

const CHATS_KEY = "upou_helpdesk_chats_v1";
const TICKETS_KEY = "upou_helpdesk_tickets_v1";

export type SupportTicket = {
  id: string;
  reference: string;
  name: string;
  email: string;
  studentId?: string;
  category: string;
  description: string;
  transcript: ChatMessage[];
  createdAt: number;
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export function loadConversations(): Conversation[] {
  return safeRead<Conversation[]>(CHATS_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveConversations(convos: Conversation[]) {
  safeWrite(CHATS_KEY, convos);
}

export function deriveTitle(firstUserMessage: string): string {
  const trimmed = firstUserMessage.trim().replace(/\s+/g, " ");
  return trimmed.length > 42 ? trimmed.slice(0, 42) + "…" : trimmed || "New chat";
}

export function loadTickets(): SupportTicket[] {
  return safeRead<SupportTicket[]>(TICKETS_KEY, []);
}

export function saveTicket(ticket: SupportTicket) {
  const all = loadTickets();
  all.unshift(ticket);
  safeWrite(TICKETS_KEY, all);
}

export function generateTicketReference(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `UPOU-${ts}-${rand}`;
}
