import { useCallback, useEffect, useRef, useState } from 'react';
import { createId } from '../chat/chat.utils';
import type {
  TranscriptionDevice,
  TranscriptionRequest,
  TranscriptionResponse,
} from './transcription.types';

export type TranscriptionStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'transcribing'
  | 'error';

interface PendingOperation {
  kind: 'load' | 'transcribe';
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}

export const useTranscription = () => {
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [progress, setProgress] = useState<number | null>(null);
  const [device, setDevice] = useState<TranscriptionDevice | null>(null);
  const [error, setError] = useState('');
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<string, PendingOperation>());
  const loadPromiseRef = useRef<Promise<void> | null>(null);

  const rejectPending = useCallback((message: string) => {
    for (const operation of pendingRef.current.values()) {
      operation.reject(new Error(message));
    }
    pendingRef.current.clear();
    loadPromiseRef.current = null;
  }, []);

  const ensureWorker = useCallback(() => {
    if (workerRef.current) {
      return workerRef.current;
    }

    const worker = new Worker(new URL('./transcription.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent<TranscriptionResponse>) => {
      const message = event.data;
      const pending = pendingRef.current.get(message.requestId);

      if (message.type === 'loading') {
        setStatus('loading');
        setProgress(message.progress);
        setDevice(message.device);
        return;
      }

      if (message.type === 'ready') {
        setStatus('ready');
        setProgress(100);
        setDevice(message.device);
        setError('');
        if (pending?.kind === 'load') {
          pending.resolve('');
          pendingRef.current.delete(message.requestId);
        }
        return;
      }

      if (message.type === 'result') {
        setStatus('ready');
        setProgress(100);
        setDevice(message.device);
        setError('');
        pending?.resolve(message.text);
        pendingRef.current.delete(message.requestId);
        return;
      }

      setStatus('error');
      setError(message.message);
      pending?.reject(new Error(message.message));
      pendingRef.current.delete(message.requestId);
      loadPromiseRef.current = null;
    };

    worker.onerror = () => {
      const message = '本地语音 Worker 运行失败，请刷新后重试。';
      setStatus('error');
      setError(message);
      rejectPending(message);
      worker.terminate();
      workerRef.current = null;
    };

    workerRef.current = worker;
    return worker;
  }, [rejectPending]);

  const loadModel = useCallback(() => {
    if (status === 'ready') {
      return Promise.resolve();
    }
    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    const worker = ensureWorker();
    const requestId = createId('transcription-load');
    setStatus('loading');
    setProgress(0);
    setError('');

    const promise = new Promise<void>((resolve, reject) => {
      pendingRef.current.set(requestId, {
        kind: 'load',
        resolve: () => resolve(),
        reject,
      });
      const request: TranscriptionRequest = { type: 'load', requestId };
      worker.postMessage(request);
    });
    loadPromiseRef.current = promise;
    const clearLoadPromise = () => {
      if (loadPromiseRef.current === promise) {
        loadPromiseRef.current = null;
      }
    };
    void promise.then(clearLoadPromise, clearLoadPromise);
    return promise;
  }, [ensureWorker, status]);

  const transcribe = useCallback(
    (samples: Float32Array) => {
      if (samples.length === 0) {
        return Promise.reject(new Error('录音内容为空，请重新录制。'));
      }

      const worker = ensureWorker();
      const requestId = createId('transcription');
      const audio = new Float32Array(samples).buffer;
      setStatus('transcribing');
      setError('');

      return new Promise<string>((resolve, reject) => {
        pendingRef.current.set(requestId, {
          kind: 'transcribe',
          resolve,
          reject,
        });
        const request: TranscriptionRequest = {
          type: 'transcribe',
          requestId,
          audio,
        };
        worker.postMessage(request, [audio]);
      });
    },
    [ensureWorker],
  );

  const resetTranscription = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    rejectPending('语音转写已取消。');
    setStatus('idle');
    setProgress(null);
    setDevice(null);
    setError('');
  }, [rejectPending]);

  useEffect(() => resetTranscription, [resetTranscription]);

  return {
    status,
    progress,
    device,
    error,
    loadModel,
    transcribe,
    resetTranscription,
  };
};
