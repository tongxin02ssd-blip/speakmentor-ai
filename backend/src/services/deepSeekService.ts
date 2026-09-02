import type { ChatStreamRequest } from '../types/chat';
import { consumeSseData } from '../utils/sse';
import { getDeepSeekConfig, readDeepSeekError } from './deepSeekConfig';
import { buildTutorSystemPrompt } from './promptService';

interface DeepSeekChunk {
  choices?: Array<{
    delta?: {
      content?: string | null;
    };
  }>;
}

export const streamDeepSeekChat = async (
  request: ChatStreamRequest,
  onToken: (token: string) => void,
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
        { role: 'system', content: buildTutorSystemPrompt(request.topic) },
        ...request.messages,
      ],
      stream: true,
      temperature: 0.6,
      max_tokens: 600,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readDeepSeekError(response));
  }

  if (!response.body) {
    throw new Error('DeepSeek response stream is unavailable');
  }

  let receivedDone = false;
  let receivedContent = false;

  await consumeSseData(response.body, (data) => {
    if (data === '[DONE]') {
      receivedDone = true;
      return false;
    }

    let chunk: DeepSeekChunk;
    try {
      chunk = JSON.parse(data) as DeepSeekChunk;
    } catch {
      throw new Error('DeepSeek returned an invalid stream event');
    }

    const token = chunk.choices?.[0]?.delta?.content;
    if (typeof token === 'string' && token.length > 0) {
      receivedContent = true;
      onToken(token);
    }
  });

  if (!receivedDone) {
    throw new Error('DeepSeek stream ended unexpectedly');
  }

  if (!receivedContent) {
    throw new Error('DeepSeek returned an empty reply');
  }
};
