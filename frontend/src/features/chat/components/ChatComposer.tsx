import { useEffect, useRef } from 'react';
import { MicIcon, SendIcon, StopIcon } from '../../../shared/Icons';

interface ChatComposerProps {
  value: string;
  isResponding: boolean;
  isRecording: boolean;
  isVoiceBusy: boolean;
  isVoiceSupported: boolean;
  statusMessage: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceInput: () => void;
  onStopGenerating: () => void;
}

function ChatComposer({
  value,
  isResponding,
  isRecording,
  isVoiceBusy,
  isVoiceSupported,
  statusMessage,
  onChange,
  onSend,
  onVoiceInput,
  onStopGenerating,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, [value]);

  return (
    <div className="composer-section">
      {statusMessage && (
        <p className="composer-status" role="status">
          {statusMessage}
        </p>
      )}
      <div className="composer">
        <button
          className={`composer-icon-button ${isRecording ? 'recording' : ''}`}
          type="button"
          disabled={isVoiceBusy || !isVoiceSupported}
          aria-label={isRecording ? '停止录音' : '开始录音'}
          title={
            isVoiceSupported
              ? isRecording
                ? '停止录音'
                : '开始录音'
              : '当前浏览器暂不支持录音'
          }
          onClick={onVoiceInput}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          maxLength={4000}
          value={value}
          placeholder="Write your answer in English…"
          aria-label="英文消息"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
        />

        <button
          className={`send-button ${isResponding ? 'stop-generating-button' : ''}`}
          type="button"
          disabled={!isResponding && !value.trim()}
          aria-label={isResponding ? '停止生成' : '发送消息'}
          title={isResponding ? '停止生成' : '发送消息'}
          onClick={isResponding ? onStopGenerating : onSend}
        >
          {isResponding ? <StopIcon /> : <SendIcon />}
        </button>
      </div>
      <p className="composer-footnote">
        Enter 发送 · Shift + Enter 换行 · 语音在浏览器本地转写
      </p>
    </div>
  );
}

export default ChatComposer;
