export type Role = 'user' | 'bot';



export interface ChatResponse {
  reply: string;
}

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type Session = {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

export type ChatState = {
  messages: Message[];
  sessions: Session[];
  allSessionIds: string[];
  activeSessionId: string | null;

  loading: boolean;
  loadingHistory: boolean;
  errorMsg: string | null;

  hasMoreMessages: boolean;
  sidebarPage: number;
};