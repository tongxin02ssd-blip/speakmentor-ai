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
  // 语音识别最终产出的文本内容，会显示在语音输入面板里。
  recognizedText: string;

  // 把识别结果包装成一条“用户消息”，方便直接追加到对话列表。
  userMessage: DialogueMessage;
  
  // 本次 mock 识别的耗时数据，用来展示识别用了多少毫秒。
  latency: LatencyMetrics;
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