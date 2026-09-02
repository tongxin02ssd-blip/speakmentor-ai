export type ScenarioKey = 'interview' | 'restaurant' | 'meeting' | 'custom';

export interface PracticeScenario {
  key: ScenarioKey;
  label: string;
  englishLabel: string;
  description: string;
}

export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'pending' | 'streaming' | 'done' | 'error';
export type TtsStatus = 'idle' | 'speaking' | 'success' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
  requestId?: string;
  wasStopped?: boolean;
}

export interface ChatState {
  sessionId: string;
  activeRequestId: string | null;
  messages: ChatMessage[];
  error: string | null;
}

export interface ConversationMessage {
  role: MessageRole;
  content: string;
}

export interface SessionSummary {
  topic: string;
  strengths: string[];
  improvements: string[];
  naturalExpressions: string[];
  nextPracticeSuggestion: string;
}
