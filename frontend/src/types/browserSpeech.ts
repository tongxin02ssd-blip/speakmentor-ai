export interface BrowserSpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface BrowserSpeechRecognitionResult {
  readonly length: number;
  [index: number]: BrowserSpeechRecognitionAlternative;
}

export interface BrowserSpeechRecognitionResultList {
  readonly length: number;
  [index: number]: BrowserSpeechRecognitionResult;
}

export interface BrowserSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: BrowserSpeechRecognitionResultList;
}

export interface BrowserSpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;

  start: () => void;
  stop: () => void;
  abort: () => void;

  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
}

export type BrowserSpeechRecognitionConstructor =
  new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}