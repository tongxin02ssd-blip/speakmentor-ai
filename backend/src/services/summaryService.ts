import type {
  SessionSummary,
  SessionSummaryRequest,
} from '../types/chat';
import { getDeepSeekConfig, readDeepSeekError } from './deepSeekConfig';

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const isStringList = (
  value: unknown,
  minimum: number,
  maximum: number,
): value is string[] =>
  Array.isArray(value) &&
  value.length >= minimum &&
  value.length <= maximum &&
  value.every(
    (item) =>
      typeof item === 'string' &&
      item.trim().length > 0 &&
      item.trim().length <= 300,
  );

const parseSummary = (content: string): SessionSummary => {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    throw new Error('DeepSeek returned invalid summary JSON');
  }

  if (typeof value !== 'object' || value === null) {
    throw new Error('DeepSeek returned an invalid summary object');
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
    topic.trim().length > 100 ||
    !isStringList(strengths, 1, 5) ||
    !isStringList(improvements, 3, 3) ||
    !isStringList(naturalExpressions, 3, 3) ||
    typeof nextPracticeSuggestion !== 'string' ||
    !nextPracticeSuggestion.trim() ||
    nextPracticeSuggestion.trim().length > 400
  ) {
    throw new Error('DeepSeek summary did not match the required structure');
  }

  return {
    topic: topic.trim(),
    strengths: strengths.map((item) => item.trim()),
    improvements: improvements.map((item) => item.trim()),
    naturalExpressions: naturalExpressions.map((item) => item.trim()),
    nextPracticeSuggestion: nextPracticeSuggestion.trim(),
  };
};

const buildSummaryPrompt = (request: SessionSummaryRequest) => `
Review this English speaking practice session about "${request.topic}".

Conversation:
${request.messages
  .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
  .join('\n')}

Return one JSON object with exactly these keys:
{
  "topic": "short topic name",
  "strengths": ["one or more specific strengths"],
  "improvements": ["exactly three high-value issues with concise advice"],
  "naturalExpressions": ["exactly three improved English expressions"],
  "nextPracticeSuggestion": "one concrete suggestion for the next session"
}

Use concise, encouraging Chinese for explanations. Keep naturalExpressions in English.
Do not include Markdown or any text outside the JSON object.
`.trim();

export const createSessionSummary = async (
  request: SessionSummaryRequest,
  signal: AbortSignal,
) => {
  const { apiKey, model, url } = getDeepSeekConfig();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an English tutor producing a structured session review.',
        },
        { role: 'user', content: buildSummaryPrompt(request) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 900,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readDeepSeekError(response));
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('DeepSeek returned an empty summary');
  }

  return parseSummary(content);
};
