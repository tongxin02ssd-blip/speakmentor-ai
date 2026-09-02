import type { NextFunction, Request, Response } from 'express';
import { streamDeepSeekChat } from '../services/deepSeekService';
import type { ChatMessage, ChatStreamRequest } from '../types/chat';

const MAX_MESSAGES = 60;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_TOTAL_CHARS = 60_000;

const isNonEmptyString = (
  value: unknown,
  maxLength: number,
): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.trim().length <= maxLength;

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const role = 'role' in value ? value.role : undefined;
  const content = 'content' in value ? value.content : undefined;
  return (
    (role === 'user' || role === 'assistant') &&
    isNonEmptyString(content, MAX_MESSAGE_CHARS)
  );
};

const parseChatRequest = (body: unknown): ChatStreamRequest | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const sessionId = 'sessionId' in body ? body.sessionId : undefined;
  const requestId = 'requestId' in body ? body.requestId : undefined;
  const topic = 'topic' in body ? body.topic : undefined;
  const messages = 'messages' in body ? body.messages : undefined;

  if (
    !isNonEmptyString(sessionId, 128) ||
    !isNonEmptyString(requestId, 128) ||
    !isNonEmptyString(topic, 80) ||
    !Array.isArray(messages) ||
    messages.length > MAX_MESSAGES ||
    !messages.every(isChatMessage)
  ) {
    return null;
  }

  const totalChars = messages.reduce(
    (total, message) => total + message.content.trim().length,
    0,
  );

  if (totalChars > MAX_TOTAL_CHARS) {
    return null;
  }

  return {
    sessionId: sessionId.trim(),
    requestId: requestId.trim(),
    topic: topic.trim(),
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content.trim(),
    })),
  };
};

const sendEvent = (
  res: Response,
  event: 'token' | 'done' | 'error',
  data: Record<string, string>,
) => {
  if (!res.writableEnded && !res.destroyed) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
};

export const streamChat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const request = parseChatRequest(req.body);

  if (!request) {
    return res.status(400).json({
      message: 'Invalid chat request. Check the topic, message history, and IDs.',
    });
  }

  res.status(200);
  res.set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  const controller = new AbortController();
  const heartbeat = setInterval(() => {
    if (!res.writableEnded && !res.destroyed) {
      res.write(': keep-alive\n\n');
    }
  }, 15_000);

  const abortUpstream = () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  };
  res.on('close', abortUpstream);

  try {
    await streamDeepSeekChat(
      request,
      (token) => sendEvent(res, 'token', { requestId: request.requestId, token }),
      controller.signal,
    );

    sendEvent(res, 'done', { requestId: request.requestId });
  } catch (error) {
    if (!controller.signal.aborted) {
      console.error(
        '[chat stream error]',
        error instanceof Error ? error.message : error,
      );
      sendEvent(res, 'error', {
        requestId: request.requestId,
        code: 'AI_STREAM_ERROR',
        message: 'AI reply failed. Please try again.',
      });
    }
  } finally {
    clearInterval(heartbeat);
    res.off('close', abortUpstream);
    if (!res.writableEnded && !res.destroyed) {
      res.end();
    }
  }

  void next;
};
