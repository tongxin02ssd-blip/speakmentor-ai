import { useCallback, useEffect, useReducer, useRef } from 'react';
import type {
  ChatMessage,
  ConversationMessage,
  ScenarioKey,
} from '../chat.types';
import { createId, createSessionId } from '../chat.utils';
import { streamChat } from '../services/chatApi';
import { chatReducer } from '../state/chatReducer';

const createInitialState = () => ({
  sessionId: createSessionId(),
  activeRequestId: null,
  messages: [],
  error: null,
});

interface TopicOptions {
  scenarioKey: ScenarioKey;
  scenarioName: string;
}

interface SendMessageOptions extends TopicOptions {
  text: string;
}

interface ActiveRequest {
  sessionId: string;
  requestId: string;
  controller: AbortController;
}

const toConversationHistory = (messages: ChatMessage[]) =>
  messages
    .filter(
      (message) =>
        message.status === 'done' &&
        !message.wasStopped &&
        message.content.trim().length > 0,
    )
    .map<ConversationMessage>((message) => ({
      role: message.role,
      content: message.content,
    }));

export const useChatSession = () => {
  const [state, dispatch] = useReducer(chatReducer, undefined, createInitialState);
  const activeRequestRef = useRef<ActiveRequest | null>(null);

  const resetConversation = useCallback(() => {
    activeRequestRef.current?.controller.abort();
    activeRequestRef.current = null;
    dispatch({ type: 'reset', sessionId: createSessionId() });
  }, []);

  const stopGenerating = useCallback(() => {
    const activeRequest = activeRequestRef.current;
    if (!activeRequest) {
      return;
    }

    activeRequest.controller.abort();
    dispatch({
      type: 'cancel',
      sessionId: activeRequest.sessionId,
      requestId: activeRequest.requestId,
    });
    activeRequestRef.current = null;
  }, []);

  const beginStream = useCallback(
    async ({
      topic,
      history,
      userMessage,
    }: {
      topic: string;
      history: ConversationMessage[];
      userMessage?: ChatMessage;
    }) => {
      if (state.activeRequestId) {
        return;
      }

      const requestId = createId('request');
      const sessionId = state.sessionId;
      const controller = new AbortController();
      const assistantMessage: ChatMessage = {
        id: createId('message'),
        role: 'assistant',
        content: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        requestId,
      };

      activeRequestRef.current?.controller.abort();
      activeRequestRef.current = { sessionId, requestId, controller };
      dispatch({
        type: 'submit',
        sessionId,
        requestId,
        userMessage,
        assistantMessage,
      });

      try {
        await streamChat({
          sessionId,
          requestId,
          topic,
          messages: history,
          signal: controller.signal,
          onToken: (token) => {
            dispatch({ type: 'append', sessionId, requestId, token });
          },
        });
        dispatch({ type: 'finish', sessionId, requestId });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const detail =
          error instanceof TypeError
            ? '无法连接 AI 服务，请检查后端与网络。'
            : error instanceof Error
              ? error.message
              : 'AI 服务暂时不可用。';
        dispatch({
          type: 'reject',
          sessionId,
          requestId,
          message: `无法获取 AI 回复：${detail}`,
        });
      } finally {
        if (activeRequestRef.current?.controller === controller) {
          activeRequestRef.current = null;
        }
      }
    },
    [state.activeRequestId, state.sessionId],
  );

  const sendMessage = useCallback(
    async ({ text, scenarioName }: SendMessageOptions) => {
      const content = text.trim();
      if (!content || state.activeRequestId) {
        return;
      }

      const userMessage: ChatMessage = {
        id: createId('message'),
        role: 'user',
        content,
        status: 'done',
        createdAt: new Date().toISOString(),
      };
      const history = [
        ...toConversationHistory(state.messages),
        { role: 'user' as const, content },
      ];

      await beginStream({ topic: scenarioName, history, userMessage });
    },
    [beginStream, state.activeRequestId, state.messages],
  );

  const startConversation = useCallback(
    async ({ scenarioName }: TopicOptions) => {
      if (state.messages.length > 0 || state.activeRequestId) {
        return;
      }
      await beginStream({ topic: scenarioName, history: [] });
    },
    [beginStream, state.activeRequestId, state.messages.length],
  );

  useEffect(() => {
    return () => activeRequestRef.current?.controller.abort();
  }, []);

  return {
    ...state,
    isResponding: state.activeRequestId !== null,
    resetConversation,
    sendMessage,
    startConversation,
    stopGenerating,
  };
};
