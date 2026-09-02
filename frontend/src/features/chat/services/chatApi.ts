import type { ConversationMessage } from '../chat.types';

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
).replace(/\/$/, '');

interface StreamChatOptions {
  sessionId: string;
  requestId: string;
  topic: string;
  messages: ConversationMessage[];
  signal: AbortSignal;
  onToken: (token: string) => void;
}

interface ParsedSseEvent {
  event: string;
  data: string;
}

const pullEventBlock = (buffer: string) => {
  const match = /\r?\n\r?\n/.exec(buffer);
  if (!match || match.index === undefined) {
    return null;
  }

  return {
    block: buffer.slice(0, match.index),
    rest: buffer.slice(match.index + match[0].length),
  };
};

const parseSseEvent = (block: string): ParsedSseEvent | null => {
  let event = 'message';
  const dataLines: string[] = [];

  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) {
      continue;
    }

    const separatorIndex = line.indexOf(':');
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    let value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1);
    if (value.startsWith(' ')) {
      value = value.slice(1);
    }

    if (field === 'event') {
      event = value;
    } else if (field === 'data') {
      dataLines.push(value);
    }
  }

  return dataLines.length > 0 ? { event, data: dataLines.join('\n') } : null;
};

const readResponseMessage = async (response: Response) => {
  const body: unknown = await response.json().catch(() => null);
  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof body.message === 'string'
  ) {
    return response.status >= 500
      ? 'AI 服务暂时不可用，请稍后重试。'
      : body.message;
  }
  return `Request failed (${response.status})`;
};

const parsePayload = (data: string): Record<string, unknown> => {
  try {
    const value: unknown = JSON.parse(data);
    return typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    throw new Error('The server returned an invalid stream event');
  }
};

export const streamChat = async ({
  sessionId,
  requestId,
  topic,
  messages,
  signal,
  onToken,
}: StreamChatOptions) => {
  const response = await fetch(`${apiBaseUrl}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, requestId, topic, messages }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readResponseMessage(response));
  }
  if (!response.body) {
    throw new Error('Streaming is not supported by this browser');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let receivedDone = false;
  let receivedContent = false;

  const handleBlock = (block: string) => {
    const parsed = parseSseEvent(block);
    if (!parsed) {
      return;
    }

    const payload = parsePayload(parsed.data);
    if (payload.requestId !== requestId) {
      return;
    }

    if (parsed.event === 'token' && typeof payload.token === 'string') {
      receivedContent = receivedContent || payload.token.length > 0;
      onToken(payload.token);
      return;
    }

    if (parsed.event === 'done') {
      receivedDone = true;
      return;
    }

    if (parsed.event === 'error') {
      if (payload.code === 'AI_STREAM_ERROR') {
        throw new Error('AI 回复中断，请重试。');
      }
      throw new Error(
        typeof payload.message === 'string'
          ? payload.message
          : 'AI reply failed',
      );
    }
  };

  const consumeBuffer = () => {
    let eventBlock = pullEventBlock(buffer);
    while (eventBlock) {
      buffer = eventBlock.rest;
      handleBlock(eventBlock.block);
      eventBlock = pullEventBlock(buffer);
    }
  };

  try {
    while (!receivedDone) {
      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        consumeBuffer();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      consumeBuffer();
    }

    if (!receivedDone && buffer.trim()) {
      handleBlock(buffer);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }

  if (!receivedDone) {
    throw new Error('The AI stream ended unexpectedly');
  }
  if (!receivedContent) {
    throw new Error('The AI returned an empty reply');
  }
};
