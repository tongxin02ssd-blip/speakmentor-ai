import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage, ConversationMessage, SessionSummary } from '../chat.types';
import { requestSessionSummary } from '../services/summaryApi';

export type SummaryStatus = 'idle' | 'loading' | 'success' | 'error';

const toSummaryHistory = (messages: ChatMessage[]) =>
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

export const useSessionSummary = () => {
  const [status, setStatus] = useState<SummaryStatus>('idle');
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [error, setError] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  const generateSummary = useCallback(
    async (topic: string, messages: ChatMessage[]) => {
      const history = toSummaryHistory(messages);
      if (history.length === 0) {
        setStatus('error');
        setError('当前还没有可总结的对话。');
        return;
      }

      controllerRef.current?.abort();
      const controller = new AbortController();
      let didTimeOut = false;
      const timeout = window.setTimeout(() => {
        didTimeOut = true;
        controller.abort();
      }, 75_000);
      controllerRef.current = controller;
      setStatus('loading');
      setSummary(null);
      setError('');

      try {
        const result = await requestSessionSummary({
          topic,
          messages: history,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setSummary(result);
          setStatus('success');
        }
      } catch (requestError) {
        if (didTimeOut) {
          setStatus('error');
          setError('生成总结超时，请检查网络后重试。');
        } else if (!controller.signal.aborted) {
          setStatus('error');
          setError(
            requestError instanceof TypeError
              ? '无法连接总结服务，请检查后端与网络。'
              : requestError instanceof Error
              ? requestError.message
              : '暂时无法生成会话总结。',
          );
        }
      } finally {
        window.clearTimeout(timeout);
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
      }
    },
    [],
  );

  const resetSummary = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStatus('idle');
    setSummary(null);
    setError('');
  }, []);

  useEffect(() => resetSummary, [resetSummary]);

  return { status, summary, error, generateSummary, resetSummary };
};
