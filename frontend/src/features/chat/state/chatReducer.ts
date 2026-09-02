import type { ChatMessage, ChatState } from '../chat.types';

type ChatAction =
  | {
      type: 'submit';
      sessionId: string;
      requestId: string;
      userMessage?: ChatMessage;
      assistantMessage: ChatMessage;
    }
  | {
      type: 'append';
      sessionId: string;
      requestId: string;
      token: string;
    }
  | {
      type: 'finish';
      sessionId: string;
      requestId: string;
    }
  | {
      type: 'reject';
      sessionId: string;
      requestId: string;
      message: string;
    }
  | {
      type: 'cancel';
      sessionId: string;
      requestId: string;
    }
  | { type: 'reset'; sessionId: string };

const belongsToActiveRequest = (
  state: ChatState,
  action: { sessionId: string; requestId: string },
) => {
  return (
    state.sessionId === action.sessionId &&
    state.activeRequestId === action.requestId
  );
};

export const chatReducer = (
  state: ChatState,
  action: ChatAction,
): ChatState => {
  switch (action.type) {
    case 'submit':
      if (state.sessionId !== action.sessionId) {
        return state;
      }

      return {
        ...state,
        activeRequestId: action.requestId,
        error: null,
        messages: action.userMessage
          ? [...state.messages, action.userMessage, action.assistantMessage]
          : [...state.messages, action.assistantMessage],
      };

    case 'append':
      if (!belongsToActiveRequest(state, action)) {
        return state;
      }

      return {
        ...state,
        messages: state.messages.map((message) =>
          message.requestId === action.requestId && message.role === 'assistant'
            ? {
                ...message,
                content: message.content + action.token,
                status: 'streaming',
              }
            : message,
        ),
      };

    case 'finish': {
      if (!belongsToActiveRequest(state, action)) {
        return state;
      }

      const assistant = state.messages.find(
        (message) =>
          message.requestId === action.requestId && message.role === 'assistant',
      );

      if (!assistant?.content.trim()) {
        return {
          ...state,
          activeRequestId: null,
          error: 'AI 返回了空回复，请重试。',
          messages: state.messages.map((message) =>
            message.id === assistant?.id ? { ...message, status: 'error' } : message,
          ),
        };
      }

      return {
        ...state,
        activeRequestId: null,
        messages: state.messages.map((message) =>
          message.id === assistant.id ? { ...message, status: 'done' } : message,
        ),
      };
    }

    case 'reject':
      if (!belongsToActiveRequest(state, action)) {
        return state;
      }

      return {
        ...state,
        activeRequestId: null,
        error: action.message,
        messages: state.messages.map((message) =>
          message.requestId === action.requestId && message.role === 'assistant'
            ? { ...message, status: 'error' }
            : message,
        ),
      };

    case 'cancel':
      if (!belongsToActiveRequest(state, action)) {
        return state;
      }

      return {
        ...state,
        activeRequestId: null,
        error: null,
        messages: state.messages.map((message) =>
          message.requestId === action.requestId && message.role === 'assistant'
            ? {
                ...message,
                content: message.content || 'Generation stopped.',
                status: 'done',
                wasStopped: true,
              }
            : message,
        ),
      };

    case 'reset':
      return {
        sessionId: action.sessionId,
        activeRequestId: null,
        messages: [],
        error: null,
      };
  }
};
