import type {
  DialogueMessage,
  MockAiReplyResult,
  MockAsrResult,
  MockDialogueResult,
  PracticeReport,
  ScenarioKey,
  ScoreResult,
} from '../types/practice';

const mockUserTexts: Record<ScenarioKey, string> = {
  interview:
    'I would like to introduce my frontend project. It is an AI speaking practice tool.',
  restaurant:
    'I would like to order a coffee and a sandwich. Do you have any recommendations?',
  meeting:
    'I think we should improve the user experience and make the interface cleaner.',
  custom:
    'I want to practice speaking English in this custom situation.',
};

const mockAiReplies: Record<ScenarioKey, string> = {
  interview:
    'That sounds interesting. Could you explain your role in this project and what technical challenges you solved?',
  restaurant:
    'Of course. I recommend our chicken sandwich and iced latte. Would you like anything else?',
  meeting:
    'That is a good point. Could you share one specific example of how we can improve the user experience?',
  custom:
    'Great. Let us continue this conversation based on your custom scenario. Could you tell me more?',
};

const createId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getNow = () => new Date().toISOString();

const createScore = (): ScoreResult => {
  const fluency = 82;
  const accuracy = 78;
  const naturalness = 75;
  const scenarioCompletion = 86;
  const overall = Math.round(
    (fluency + accuracy + naturalness + scenarioCompletion) / 4,
  );

  return {
    fluency,
    accuracy,
    naturalness,
    scenarioCompletion,
    overall,
  };
};

interface CreateMockAsrParams {
  scenarioKey: ScenarioKey;
  scenarioName: string;
}

export const createMockAsrResult = ({
  scenarioKey,
  scenarioName,
}: CreateMockAsrParams): MockAsrResult => {
  const recognizedText = mockUserTexts[scenarioKey];

  const latency = {
    asrMs: 820,
    aiMs: 0,
    totalMs: 820,
  };

  const userMessage: DialogueMessage = {
    id: createId('user-message'),
    role: 'user',
    content: recognizedText,
    scenarioKey,
    scenarioName,
    createdAt: getNow(),
    latency,
  };

  return {
    recognizedText,
    userMessage,
    latency,
  };
};

interface CreateMockAiReplyParams {
  scenarioKey: ScenarioKey;
  scenarioName: string;
  userText: string;
  asrMs: number;
}

export const createMockAiReplyResult = ({
  scenarioKey,
  scenarioName,
  userText,
  asrMs,
}: CreateMockAiReplyParams): MockAiReplyResult => {
  const aiMs = 960;
  const totalMs = asrMs + aiMs;

  const baseReply = mockAiReplies[scenarioKey];

  const aiMessage: DialogueMessage = {
    id: createId('ai-message'),
    role: 'assistant',
    content: `${baseReply} I noticed you said: “${userText}”`,
    scenarioKey,
    scenarioName,
    createdAt: getNow(),
    latency: {
      asrMs,
      aiMs,
      totalMs,
    },
  };

  return {
    aiMessage,
    latency: {
      asrMs,
      aiMs,
      totalMs,
    },
  };
};

interface CreateMockDialogueParams {
  scenarioKey: ScenarioKey;
  scenarioName: string;
  userText?: string;
}

export const createMockDialogueResult = ({
  scenarioKey,
  scenarioName,
  userText,
}: CreateMockDialogueParams): MockDialogueResult => {
  const finalUserText = userText?.trim() || mockUserTexts[scenarioKey];

  const userMessage: DialogueMessage = {
    id: createId('user-message'),
    role: 'user',
    content: finalUserText,
    scenarioKey,
    scenarioName,
    createdAt: getNow(),
    latency: {
      asrMs: 680,
      aiMs: 0,
      totalMs: 680,
    },
  };

  const aiMessage: DialogueMessage = {
    id: createId('ai-message'),
    role: 'assistant',
    content: mockAiReplies[scenarioKey],
    scenarioKey,
    scenarioName,
    createdAt: getNow(),
    latency: {
      asrMs: 680,
      aiMs: 920,
      totalMs: 1600,
    },
  };

  return {
    userMessage,
    aiMessage,
    feedback: {
      messageId: userMessage.id,
      correction: {
        originalText: finalUserText,
        correctedText:
          'I would like to introduce my frontend project. It is an AI-powered speaking practice tool.',
        naturalExpression:
          'I would like to walk you through my frontend project, which is an AI-powered tool for English speaking practice.',
        explanation:
          'Your sentence is understandable. The improved version sounds more natural and uses “walk you through” to make the expression more fluent in a project introduction context.',
        keyPoints: [
          'Use “would like to” for a more polite tone.',
          'Use “AI-powered” as a natural adjective before a product noun.',
          'Use “walk you through” when introducing a project.',
        ],
      },
      pronunciation: {
        fluencyComment:
          'Your expression is mostly fluent, with only minor pauses between phrases.',
        pronunciationComment:
          'Most words are clear. Pay attention to the pronunciation of “frontend” and “practice”.',
        paceComment:
          'The speaking pace is stable and suitable for a formal conversation.',
        improvementTip:
          'Try to group words into meaningful chunks instead of reading word by word.',
      },
      score: createScore(),
    },
  };
};

interface CreateMockReportParams {
  scenarioName: string;
  totalTurns: number;
}

export const createMockPracticeReport = ({
  scenarioName,
  totalTurns,
}: CreateMockReportParams): PracticeReport => {
  return {
    id: createId('practice-report'),
    scenarioName,
    totalTurns,
    durationText: '约 3 分钟',
    overallScore: 80,
    strengths: [
      '能够围绕当前场景完成基本英文表达。',
      '表达意图清晰，适合继续进行多轮对话训练。',
      '部分句子已经具备正式交流场景中的表达意识。',
    ],
    improvements: [
      '可以减少中式英文表达，使用更自然的英文短语。',
      '回答问题时可以增加具体例子，让表达更完整。',
      '注意控制停顿，提升整体流畅度。',
    ],
    commonErrors: [
      '部分表达偏直译，不够自然。',
      '项目介绍类句子可以使用更正式的动词短语。',
      '个别单词发音需要加强。',
    ],
    nextPracticeTips: [
      '下一轮练习时尝试使用更完整的回答结构。',
      '优先练习自我介绍、项目介绍和观点表达。',
      '可以记录常用表达并在下一次对话中主动使用。',
    ],
    generatedAt: getNow(),
  };
};