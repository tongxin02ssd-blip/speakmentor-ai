import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TtsStatus } from '../chat/chat.types';

export const useTextToSpeech = () => {
  const [ttsStatus, setTtsStatus] = useState<TtsStatus>('idle');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState('');
  const speechGenerationRef = useRef(0);
  const isSupported = useMemo(
    () =>
      'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    [],
  );

  const stopSpeaking = useCallback(() => {
    speechGenerationRef.current += 1;
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setTtsStatus('idle');
  }, [isSupported]);

  const speak = useCallback(
    (text: string, messageId: string) => {
      const content = text.trim();

      if (!isSupported || !content) {
        setTtsStatus('error');
        setTtsError(
          isSupported ? '这条回复没有可朗读的内容。' : '当前浏览器不支持语音朗读。',
        );
        return;
      }

      speechGenerationRef.current += 1;
      const generation = speechGenerationRef.current;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;

      utterance.onstart = () => {
        if (speechGenerationRef.current !== generation) {
          return;
        }
        setTtsError('');
        setTtsStatus('speaking');
        setSpeakingMessageId(messageId);
      };
      utterance.onend = () => {
        if (speechGenerationRef.current !== generation) {
          return;
        }
        setTtsStatus('success');
        setSpeakingMessageId(null);
      };
      utterance.onerror = () => {
        if (speechGenerationRef.current !== generation) {
          return;
        }
        setTtsStatus('error');
        setSpeakingMessageId(null);
        setTtsError('语音朗读失败，请稍后重试。');
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported],
  );

  useEffect(() => {
    return () => {
      if (isSupported) {
        speechGenerationRef.current += 1;
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    isSupported,
    ttsStatus,
    speakingMessageId,
    ttsError,
    speak,
    stopSpeaking,
  };
};
