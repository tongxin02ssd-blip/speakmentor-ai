export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatStreamRequest {
  sessionId: string;
  requestId: string;
  topic: string;
  messages: ChatMessage[];
}

export interface SessionSummaryRequest {
  topic: string;
  messages: ChatMessage[];
}

export interface SessionSummary {
  topic: string;
  strengths: string[];
  improvements: string[];
  naturalExpressions: string[];
  nextPracticeSuggestion: string;
}
