export type ScenarioKey = 'interview' | 'restaurant' | 'meeting' | 'custom';

export interface DialogueRequest {
  scenarioKey: ScenarioKey;
  scenarioName: string;
  userText: string;
}

export interface LatencyMetrics {
  asrMs: number;
  aiMs: number;
  totalMs: number;
}

export interface DialogueMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  scenarioKey: ScenarioKey;
  scenarioName: string;
  createdAt: string;
  latency?: LatencyMetrics;
}

export interface CorrectionFeedback {
  originalText: string;
  correctedText: string;
  naturalExpression: string;
  explanation: string;
  keyPoints: string[];
}

export interface PronunciationFeedback {
  fluencyComment: string;
  pronunciationComment: string;
  paceComment: string;
  improvementTip: string;
}

export interface ScoreResult {
  fluency: number;
  accuracy: number;
  naturalness: number;
  scenarioCompletion: number;
  overall: number;
}

export interface DialogueTurnFeedback {
  messageId: string;
  correction: CorrectionFeedback;
  pronunciation: PronunciationFeedback;
  score: ScoreResult;
}

export interface DialogueResponse {
  aiMessage: DialogueMessage;
  feedback: DialogueTurnFeedback;
  mode: 'mock' | 'ai';
}