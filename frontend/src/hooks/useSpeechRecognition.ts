import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  BrowserSpeechRecognition,
  BrowserSpeechRecognitionConstructor,
} from '../types/browserSpeech';
import type { BrowserAsrResult } from '../types/practice';

const getSpeechRecognitionConstructor =
  (): BrowserSpeechRecognitionConstructor | null => {
    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
  };

export const useSpeechRecognition = () => {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);

  const isSupported = useMemo(() => {
    return typeof window !== 'undefined' && Boolean(getSpeechRecognitionConstructor());
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
  }, []);

  const startRecognition = useCallback((): Promise<BrowserAsrResult> => {
    return new Promise((resolve, reject) => {
      const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();

      if (!SpeechRecognitionConstructor) {
        reject(new Error('当前浏览器不支持 SpeechRecognition'));
        return;
      }

      const recognition = new SpeechRecognitionConstructor();
      const startedAt = performance.now();

      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const result = event.results[event.resultIndex];
        const alternative = result?.[0];
        const transcript = alternative?.transcript?.trim();

        if (!transcript) {
          reject(new Error('未识别到有效英文内容'));
          return;
        }

        const asrMs = Math.round(performance.now() - startedAt);

        resolve({
          recognizedText: transcript,
          latency: {
            asrMs,
            aiMs: 0,
            totalMs: asrMs,
          },
        });
      };

      recognition.onerror = (event) => {
        reject(new Error(event.message || event.error || '语音识别失败'));
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    });
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    startRecognition,
    stopRecognition,
  };
};