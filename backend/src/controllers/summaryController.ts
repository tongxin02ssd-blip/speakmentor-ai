import type { Request, Response } from 'express';
import { createSessionSummary } from '../services/summaryService';
import type { ChatMessage, SessionSummaryRequest } from '../types/chat';

const MAX_MESSAGES = 60;
const MAX_TOTAL_CHARS = 60_000;

const isMessage = (value: unknown): value is ChatMessage => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const role = 'role' in value ? value.role : undefined;
  const content = 'content' in value ? value.content : undefined;
  return (
    (role === 'user' || role === 'assistant') &&
    typeof content === 'string' &&
    content.trim().length > 0 &&
    content.trim().length <= 4_000
  );
};

const parseRequest = (body: unknown): SessionSummaryRequest | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const topic = 'topic' in body ? body.topic : undefined;
  const messages = 'messages' in body ? body.messages : undefined;
  if (
    typeof topic !== 'string' ||
    !topic.trim() ||
    topic.trim().length > 80 ||
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(isMessage)
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
    topic: topic.trim(),
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content.trim(),
    })),
  };
};

export const summarizeSession = async (req: Request, res: Response) => {
  const request = parseRequest(req.body);
  if (!request) {
    return res.status(400).json({
      message: 'A valid topic and conversation are required.',
    });
  }

  const controller = new AbortController();
  const abort = () => controller.abort();
  res.on('close', abort);

  try {
    const summary = await createSessionSummary(request, controller.signal);
    if (!res.writableEnded && !res.destroyed) {
      return res.status(200).json(summary);
    }
    return;
  } catch (error) {
    if (!controller.signal.aborted) {
      console.error(
        '[summary error]',
        error instanceof Error ? error.message : error,
      );
      if (!res.writableEnded && !res.destroyed) {
        return res.status(502).json({
          message: 'Session summary is unavailable. Please try again.',
        });
      }
    }
    return;
  } finally {
    res.off('close', abort);
  }
};
