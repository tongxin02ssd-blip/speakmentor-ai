/// <reference lib="webworker" />

import type {
  TranscriptionDevice,
  TranscriptionRequest,
  TranscriptionResponse,
} from './transcription.types';

const MODEL_ID = 'onnx-community/whisper-tiny.en';

interface TranscriptionOutput {
  text: string;
}

type Transcriber = (
  audio: Float32Array,
  options: { language: 'en'; task: 'transcribe' },
) => Promise<TranscriptionOutput | TranscriptionOutput[]>;

interface WorkerScope {
  postMessage: (message: TranscriptionResponse) => void;
  onmessage: ((event: MessageEvent<TranscriptionRequest>) => void) | null;
}

const workerScope = self as unknown as WorkerScope;
let pipelinePromise: Promise<Transcriber> | null = null;
let activeDevice: TranscriptionDevice = 'wasm';

const postLoading = (
  requestId: string,
  device: TranscriptionDevice,
  progress: number | null,
  detail: string,
) => {
  workerScope.postMessage({
    type: 'loading',
    requestId,
    device,
    progress,
    detail,
  });
};

const readProgress = (value: unknown) => {
  if (typeof value !== 'object' || value === null) {
    return { progress: null, detail: 'Loading speech model' };
  }

  const progress =
    'progress' in value && typeof value.progress === 'number'
      ? Math.max(0, Math.min(100, value.progress))
      : null;
  const detail =
    'status' in value && typeof value.status === 'string'
      ? value.status
      : 'Loading speech model';
  return { progress, detail };
};

const createPipeline = async (
  requestId: string,
  device: TranscriptionDevice,
) => {
  const { pipeline } = await import('@huggingface/transformers');
  postLoading(requestId, device, 0, `Initializing ${device.toUpperCase()}`);

  const transcriber = await pipeline(
    'automatic-speech-recognition',
    MODEL_ID,
    {
      device,
      progress_callback: (value: unknown) => {
        const { progress, detail } = readProgress(value);
        postLoading(requestId, device, progress, detail);
      },
    },
  );

  return transcriber as unknown as Transcriber;
};

const loadPipeline = async (requestId: string) => {
  const canUseWebGpu = 'gpu' in navigator;

  if (canUseWebGpu) {
    try {
      const transcriber = await createPipeline(requestId, 'webgpu');
      activeDevice = 'webgpu';
      return transcriber;
    } catch {
      postLoading(
        requestId,
        'wasm',
        null,
        'WebGPU unavailable, switching to WASM',
      );
    }
  }

  const transcriber = await createPipeline(requestId, 'wasm');
  activeDevice = 'wasm';
  return transcriber;
};

const getPipeline = (requestId: string) => {
  pipelinePromise ??= loadPipeline(requestId);
  return pipelinePromise;
};

const getOutputText = (output: TranscriptionOutput | TranscriptionOutput[]) => {
  const result = Array.isArray(output) ? output[0] : output;
  return result?.text?.trim() ?? '';
};

const transcribeAudio = async (requestId: string, audio: ArrayBuffer) => {
  let transcriber: Transcriber;
  try {
    transcriber = await getPipeline(requestId);
  } catch (error) {
    pipelinePromise = null;
    throw error;
  }

  const samples = new Float32Array(audio);
  const options = { language: 'en' as const, task: 'transcribe' as const };

  try {
    return await transcriber(samples, options);
  } catch (error) {
    if (activeDevice !== 'webgpu') {
      throw error;
    }

    postLoading(
      requestId,
      'wasm',
      null,
      'WebGPU inference failed, switching to WASM',
    );
    pipelinePromise = createPipeline(requestId, 'wasm');
    transcriber = await pipelinePromise;
    activeDevice = 'wasm';
    return transcriber(samples, options);
  }
};

workerScope.onmessage = (event) => {
  const request = event.data;

  void (async () => {
    try {
      if (request.type === 'load') {
        await getPipeline(request.requestId);
        workerScope.postMessage({
          type: 'ready',
          requestId: request.requestId,
          device: activeDevice,
        });
        return;
      }

      const output = await transcribeAudio(request.requestId, request.audio);
      const text = getOutputText(output);

      if (!text) {
        throw new Error('没有识别到清晰的英文，请重新录制。');
      }

      workerScope.postMessage({
        type: 'result',
        requestId: request.requestId,
        device: activeDevice,
        text,
      });
    } catch (error) {
      if (request.type === 'load') {
        pipelinePromise = null;
      }
      workerScope.postMessage({
        type: 'error',
        requestId: request.requestId,
        message:
          error instanceof Error
            ? error.message
            : '本地语音模型运行失败。',
      });
    }
  })();
};
