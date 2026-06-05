import type {
  DialogueMessage,
  DialogueTurnFeedback,
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

interface CreateMockTurnFeedbackParams {
  messageId: string;
  userText: string;
  scenarioKey: ScenarioKey;
}

export const createMockTurnFeedback = ({
  messageId,
  userText,
  scenarioKey,
}: CreateMockTurnFeedbackParams): DialogueTurnFeedback => {
  const naturalExpressionMap: Record<ScenarioKey, string> = {
    interview:
      'I would like to walk you through my frontend project, which is an AI-powered tool for English speaking practice.',
    restaurant:
      'I would like to order a coffee and a sandwich. Could you recommend something popular?',
    meeting:
      'I think we should improve the user experience by simplifying the interface and making the core actions clearer.',
    custom:
      'I would like to practice this situation in English and make my expression sound more natural and confident.',
  };

  const correctedTextMap: Record<ScenarioKey, string> = {
    interview:
      'I would like to introduce my frontend project. It is an AI-powered speaking practice tool.',
    restaurant:
      'I would like to order a coffee and a sandwich. Do you have any recommendations?',
    meeting:
      'I think we should improve the user experience and make the interface cleaner.',
    custom:
      'I want to practice speaking English in this custom situation.',
  };

  return {
    messageId,
    correction: {
      originalText: userText,
      correctedText: correctedTextMap[scenarioKey],
      naturalExpression: naturalExpressionMap[scenarioKey],
      explanation:
        '你的表达整体可以被理解，但还可以通过更自然的短语、更清晰的句子结构和更具体的场景信息来提升口语表现。',
      keyPoints: [
        '优先使用完整句表达，避免过于零散。',
        '在正式场景中可以使用 “would like to” 提升礼貌程度。',
        '表达项目或观点时，可以增加具体细节，让内容更有说服力。',
      ],
    },
    pronunciation: {
      fluencyComment:
        '整体表达比较流畅，但部分短语之间可以减少停顿，让句子连接更自然。',
      pronunciationComment:
        '大部分单词发音清晰，可以重点注意 project、practice、experience 等词的重音。',
      paceComment:
        '语速适中，适合正式交流场景。后续可以尝试更自然的语调起伏。',
      improvementTip:
        '建议把句子按意义分组朗读，例如先说目的，再说项目内容，最后补充价值。',
    },
    score: createScore(),
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
    feedback: createMockTurnFeedback({
      messageId: userMessage.id,
      userText: finalUserText,
      scenarioKey,
    }),
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