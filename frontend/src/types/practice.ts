export type ScenarioKey = 'interview' | 'restaurant' | 'meeting' | 'custom';

export interface PracticeScenario {
  key: ScenarioKey;
  title: string;
  englishTitle: string;
  description: string;
  promptHint: string;
}

export type MessageRole = 'user' | 'assistant';

export type RecognitionStatus = 'idle' | 'recognizing' | 'success' | 'error';

export type RecognitionSource = 'browser' | 'mock' | null;

export type AiReplyStatus = 'idle' | 'thinking' | 'success' | 'error';

export type FeedbackStatus = 'idle' | 'generating' | 'success' | 'error';

export type TtsStatus = 'idle' | 'speaking' | 'success' | 'error';

export type DialogueMode = 'backend-ai' | 'backend-mock' | 'frontend-mock' | null;

export type ReportStatus = 'idle' | 'generating' | 'success' | 'error';

export interface DialogueMessage {
  id: string;
  role: MessageRole;
  content: string;
  scenarioKey: ScenarioKey;
  scenarioName: string;
  createdAt: string;
  latency?: LatencyMetrics;
}

export interface LatencyMetrics {
  asrMs: number;
  aiMs: number;
  totalMs: number;
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

export interface MockAsrResult {
  recognizedText: string;
  userMessage: DialogueMessage;
  latency: LatencyMetrics;
}

export interface BrowserAsrResult {
  recognizedText: string;
  latency: LatencyMetrics;
}

export interface MockAiReplyResult {
  aiMessage: DialogueMessage;
  latency: LatencyMetrics;
}

export interface MockDialogueResult {
  userMessage: DialogueMessage;
  aiMessage: DialogueMessage;
  feedback: DialogueTurnFeedback;
}

export interface DialogueApiRequest {
  scenarioKey: ScenarioKey;
  scenarioName: string;
  userText: string;
}

export interface DialogueApiResponse {
  aiMessage: DialogueMessage;
  feedback: DialogueTurnFeedback;
  mode: 'mock' | 'ai';
}

export interface PracticeReport {
  id: string;
  scenarioName: string;
  totalTurns: number;
  durationText: string;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  commonErrors: string[];
  nextPracticeTips: string[];
  generatedAt: string;
}