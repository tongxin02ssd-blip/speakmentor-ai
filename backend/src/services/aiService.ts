import type {
  CorrectionFeedback,
  DialogueRequest,
  PronunciationFeedback,
  ScoreResult,
} from '../types/practice';
import { buildDialoguePrompt } from './promptService';

interface AiDialoguePayload {
  reply: string;
  correction: CorrectionFeedback;
  pronunciation: PronunciationFeedback;
  score: ScoreResult;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const CHAT_COMPLETIONS_PATH = 'chat/completions';

const getAiApiUrl = () => {
  const rawUrl = process.env.AI_API_URL?.trim();

  if (!rawUrl) {
    return '';
  }

  const normalizedUrl = rawUrl.replace(/\/+$/, '');

  if (/\/chat\/completions$/i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  return `${normalizedUrl}/${CHAT_COMPLETIONS_PATH}`;
};

const extractJsonText = (value: string) => {
  const trimmed = value.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error('AI response does not contain valid JSON');
  }

  return match[0];
};

const normalizeScore = (value: unknown) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  if (value < 0) return 0;
  if (value > 100) return 100;

  return Math.round(value);
};

const validateAiPayload = (value: unknown): AiDialoguePayload => {
  const payload = value as Partial<AiDialoguePayload>;

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid AI payload');
  }

  if (!payload.reply || typeof payload.reply !== 'string') {
    throw new Error('AI reply is missing');
  }

  if (!payload.correction || typeof payload.correction !== 'object') {
    throw new Error('AI correction is missing');
  }

  if (!payload.pronunciation || typeof payload.pronunciation !== 'object') {
    throw new Error('AI pronunciation feedback is missing');
  }

  if (!payload.score || typeof payload.score !== 'object') {
    throw new Error('AI score is missing');
  }

  return {
    reply: payload.reply,
    correction: {
      originalText:
        payload.correction.originalText || '',
      correctedText:
        payload.correction.correctedText || '',
      naturalExpression:
        payload.correction.naturalExpression || '',
      explanation:
        payload.correction.explanation || '',
      keyPoints: Array.isArray(payload.correction.keyPoints)
        ? payload.correction.keyPoints.map(String)
        : [],
    },
    pronunciation: {
      fluencyComment:
        payload.pronunciation.fluencyComment || '',
      pronunciationComment:
        payload.pronunciation.pronunciationComment || '',
      paceComment:
        payload.pronunciation.paceComment || '',
      improvementTip:
        payload.pronunciation.improvementTip || '',
    },
    score: {
      fluency: normalizeScore(payload.score.fluency),
      accuracy: normalizeScore(payload.score.accuracy),
      naturalness: normalizeScore(payload.score.naturalness),
      scenarioCompletion: normalizeScore(payload.score.scenarioCompletion),
      overall: normalizeScore(payload.score.overall),
    },
  };
};

export const isAiConfigured = () => {
  return Boolean(
    process.env.AI_API_KEY &&
      getAiApiUrl() &&
      process.env.AI_MODEL_NAME,
  );
};

export const requestAiDialogue = async (
  request: DialogueRequest,
): Promise<AiDialoguePayload> => {
  if (!isAiConfigured()) {
    throw new Error('AI API is not configured');
  }

  const prompt = buildDialoguePrompt(request);

  const response = await fetch(getAiApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL_NAME,
      messages: [
        {
          role: 'system',
          content:
            'You are an English speaking practice assistant. Always return strict JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const detail = errorText ? `: ${errorText.slice(0, 300)}` : '';

    throw new Error(
      `AI API request failed with status ${response.status}${detail}`,
    );
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('AI response content is empty');
  }

  const jsonText = extractJsonText(content);
  const parsed = JSON.parse(jsonText) as unknown;

  return validateAiPayload(parsed);
};
