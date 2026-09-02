export type TranscriptionDevice = 'webgpu' | 'wasm';

export type TranscriptionRequest =
  | { type: 'load'; requestId: string }
  | { type: 'transcribe'; requestId: string; audio: ArrayBuffer };

export type TranscriptionResponse =
  | {
      type: 'loading';
      requestId: string;
      device: TranscriptionDevice;
      progress: number | null;
      detail: string;
    }
  | {
      type: 'ready';
      requestId: string;
      device: TranscriptionDevice;
    }
  | {
      type: 'result';
      requestId: string;
      device: TranscriptionDevice;
      text: string;
    }
  | { type: 'error'; requestId: string; message: string };
