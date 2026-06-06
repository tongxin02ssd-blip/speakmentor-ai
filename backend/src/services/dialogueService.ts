import type {
  DialogueMessage,
  DialogueRequest,
  DialogueResponse,
  DialogueTurnFeedback,
  ScenarioKey,
  ScoreResult,
} from '../types/practice';

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

const createMockFeedback = (
  messageId: string,
  userText: string,
  scenarioKey: ScenarioKey,
): DialogueTurnFeedback => {
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

export const createMockDialogueResponse = (
  request: DialogueRequest,
): DialogueResponse => {
  const aiMs = 880;
  const asrMs = 0;
  const totalMs = aiMs;

  const aiMessage: DialogueMessage = {
    id: createId('ai-message'),
    role: 'assistant',
    content: `${mockAiReplies[request.scenarioKey]} I noticed you said: “${request.userText}”`,
    scenarioKey: request.scenarioKey,
    scenarioName: request.scenarioName,
    createdAt: new Date().toISOString(),
    latency: {
      asrMs,
      aiMs,
      totalMs,
    },
  };

  return {
    aiMessage,
    feedback: createMockFeedback(
      createId('user-message'),
      request.userText,
      request.scenarioKey,
    ),
    mode: 'mock',
  };
};