import type { ConversationMessage, SessionSummary } from '../chat.types';

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
).replace(/\/$/, '');

const isStringList = (value: unknown, expectedLength?: number): value is string[] =>
  Array.isArray(value) &&
  (expectedLength === undefined || value.length === expectedLength) &&
  value.every((item) => typeof item === 'string' && item.trim().length > 0);

const parseSummary = (value: unknown): SessionSummary => {
  if (typeof value !== 'object' || value === null) {
    throw new Error('总结格式无效');
  }

  const topic = 'topic' in value ? value.topic : undefined;
  const strengths = 'strengths' in value ? value.strengths : undefined;
  const improvements =
    'improvements' in value ? value.improvements : undefined;
  const naturalExpressions =
    'naturalExpressions' in value ? value.naturalExpressions : undefined;
  const nextPracticeSuggestion =
    'nextPracticeSuggestion' in value
      ? value.nextPracticeSuggestion
      : undefined;

  if (
    typeof topic !== 'string' ||
    !topic.trim() ||
    !isStringList(strengths) ||
    !isStringList(improvements, 3) ||
    !isStringList(naturalExpressions, 3) ||
    typeof nextPracticeSuggestion !== 'string' ||
    !nextPracticeSuggestion.trim()
  ) {
    throw new Error('总结格式无效');
  }

  return {
    topic: topic.trim(),
    strengths,
    improvements,
    naturalExpressions,
    nextPracticeSuggestion: nextPracticeSuggestion.trim(),
  };
};

const readError = async (response: Response) => {
  const body: unknown = await response.json().catch(() => null);
  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof body.message === 'string'
  ) {
    return response.status >= 500
      ? 'AI 总结服务暂时不可用，请稍后重试。'
      : body.message;
  }
  return `总结请求失败 (${response.status})`;
};

export const requestSessionSummary = async ({
  topic,
  messages,
  signal,
}: {
  topic: string;
  messages: ConversationMessage[];
  signal: AbortSignal;
}) => {
  const response = await fetch(`${apiBaseUrl}/api/session/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, messages }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return parseSummary(await response.json());
};
