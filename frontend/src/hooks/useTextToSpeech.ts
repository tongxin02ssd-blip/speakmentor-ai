import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TtsStatus } from '../types/practice';

export const useTextToSpeech = () => {
  const [ttsStatus, setTtsStatus] = useState<TtsStatus>('idle');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null,
  );
  const [ttsError, setTtsError] = useState('');

  const isSupported = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window
    );
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!isSupported) {
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setTtsStatus('idle');
  }, [isSupported]);

  const speak = useCallback(
    (text: string, messageId: string) => {
      if (!isSupported) {
        setTtsStatus('error');
        setTtsError('当前浏览器不支持语音播报。');
        return;
      }

      const finalText = text.trim();

      if (!finalText) {
        setTtsStatus('error');
        setTtsError('没有可播报的 AI 回复内容。');
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(finalText);

      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setTtsError('');
        setTtsStatus('speaking');
        setSpeakingMessageId(messageId);
      };

      utterance.onend = () => {
        setTtsStatus('success');
        setSpeakingMessageId(null);
      };

      utterance.onerror = () => {
        setTtsStatus('error');
        setSpeakingMessageId(null);
        setTtsError('AI 回复语音播报失败，请重新尝试。');
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported],
  );

  useEffect(() => {
    return () => {
      if (isSupported) {
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