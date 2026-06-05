export type ScenarioKey = 'interview' | 'restaurant' | 'meeting' | 'custom';

export interface PracticeScenario {
  key: ScenarioKey;
  title: string;
  englishTitle: string;
  description: string;
  promptHint: string;
}

export type MessageRole = 'user' | 'assistant';

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

export interface MockDialogueResult {
  userMessage: DialogueMessage;
  aiMessage: DialogueMessage;
  feedback: DialogueTurnFeedback;
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