import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type RecorderStatus =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'stopping'
  | 'error';

const preferredMimeTypes = [
  'audio/webm;codecs=opus',
  'audio/ogg;codecs=opus',
  'audio/webm',
  'audio/mp4',
];

const getSupportedMimeType = () =>
  preferredMimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';

const getRecorderErrorMessage = (error: unknown) => {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return '麦克风权限被拒绝，请在浏览器设置中允许访问。';
    }
    if (error.name === 'NotFoundError') {
      return '没有找到可用的麦克风。';
    }
    if (error.name === 'NotReadableError') {
      return '麦克风正被其他应用占用。';
    }
  }

  return error instanceof Error ? error.message : '无法开始录音。';
};

export const useAudioRecorder = () => {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopPromiseRef = useRef<{
    resolve: (blob: Blob) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const startedAtRef = useRef(0);
  const mountedRef = useRef(true);
  const operationIdRef = useRef(0);

  const isSupported = useMemo(
    () =>
      Boolean(
        'mediaDevices' in navigator &&
          'MediaRecorder' in window &&
          'AudioContext' in window,
      ),
    [],
  );

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      const message = '当前浏览器不支持录音。';
      setStatus('error');
      setError(message);
      throw new Error(message);
    }
    if (recorderRef.current?.state === 'recording') {
      return;
    }

    setStatus('requesting');
    setError('');
    setElapsedSeconds(0);
    operationIdRef.current += 1;
    const operationId = operationIdRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      if (!mountedRef.current || operationIdRef.current !== operationId) {
        stream.getTracks().forEach((track) => track.stop());
        throw new DOMException('录音已取消。', 'AbortError');
      }

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        const recordingError = new Error('录音过程中发生错误，请重试。');
        stopPromiseRef.current?.reject(recordingError);
        stopPromiseRef.current = null;
        recorderRef.current = null;
        chunksRef.current = [];
        releaseStream();
        if (mountedRef.current) {
          setError(recordingError.message);
          setStatus('error');
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        });
        chunksRef.current = [];
        recorderRef.current = null;
        releaseStream();

        if (blob.size === 0) {
          stopPromiseRef.current?.reject(
            new Error('没有录到声音，请重新录制。'),
          );
        } else {
          stopPromiseRef.current?.resolve(blob);
        }
        stopPromiseRef.current = null;

        if (mountedRef.current) {
          setStatus('idle');
        }
      };

      recorder.start(250);
      startedAtRef.current = Date.now();
      setStatus('recording');
    } catch (recordingError) {
      releaseStream();
      if (
        recordingError instanceof DOMException &&
        recordingError.name === 'AbortError'
      ) {
        if (mountedRef.current) {
          setStatus('idle');
        }
        throw recordingError;
      }
      const message = getRecorderErrorMessage(recordingError);
      if (mountedRef.current) {
        setStatus('error');
        setError(message);
      }
      throw new Error(message, { cause: recordingError });
    }
  }, [isSupported, releaseStream]);

  const stopRecording = useCallback((): Promise<Blob> => {
    const recorder = recorderRef.current;

    if (!recorder || recorder.state !== 'recording') {
      return Promise.reject(new Error('当前没有正在进行的录音。'));
    }

    setStatus('stopping');
    return new Promise<Blob>((resolve, reject) => {
      stopPromiseRef.current = { resolve, reject };
      recorder.requestData();
      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    operationIdRef.current += 1;
    const recorder = recorderRef.current;
    recorderRef.current = null;
    stopPromiseRef.current?.reject(new Error('录音已取消。'));
    stopPromiseRef.current = null;

    if (recorder && recorder.state !== 'inactive') {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      recorder.stop();
    }

    chunksRef.current = [];
    releaseStream();
    if (mountedRef.current) {
      setStatus('idle');
      setElapsedSeconds(0);
    }
  }, [releaseStream]);

  useEffect(() => {
    if (status !== 'recording') {
      return;
    }

    const updateElapsed = () => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    };
    const timer = window.setInterval(updateElapsed, 250);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.onerror = null;
        recorder.stop();
      }
      releaseStream();
    };
  }, [releaseStream]);

  return {
    isSupported,
    status,
    elapsedSeconds,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
