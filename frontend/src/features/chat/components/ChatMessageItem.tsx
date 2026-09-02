import type { ChatMessage } from '../chat.types';
import { StopIcon, VolumeIcon } from '../../../shared/Icons';

interface ChatMessageItemProps {
  message: ChatMessage;
  isSpeaking: boolean;
  canSpeak: boolean;
  onSpeak: (message: ChatMessage) => void;
  onStopSpeaking: () => void;
}

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

function ChatMessageItem({
  message,
  isSpeaking,
  canSpeak,
  onSpeak,
  onStopSpeaking,
}: ChatMessageItemProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <article className={`chat-message chat-message-${message.role}`}>
      <div className="message-heading">
        <span className="message-author">
          {isAssistant ? 'SpeakMentor' : 'You'}
        </span>
        <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
        {isAssistant && message.status === 'done' && (
          <button
            className={`icon-button ${isSpeaking ? 'icon-button-active' : ''}`}
            type="button"
            disabled={!canSpeak}
            aria-label={isSpeaking ? '停止朗读' : '朗读这条回复'}
            title={isSpeaking ? '停止朗读' : '朗读这条回复'}
            onClick={() => (isSpeaking ? onStopSpeaking() : onSpeak(message))}
          >
            {isSpeaking ? <StopIcon /> : <VolumeIcon />}
          </button>
        )}
      </div>

      <div className={`message-body ${isSpeaking ? 'message-body-speaking' : ''}`}>
        {message.status === 'pending' ? (
          <span className="thinking-dots" aria-label="AI 正在思考">
            <i />
            <i />
            <i />
          </span>
        ) : message.status === 'error' ? (
          <span className="message-error">这次回复没有成功，请重新发送。</span>
        ) : (
          <p>{message.content}</p>
        )}
        {message.wasStopped && (
          <span className="message-stop-note">已停止生成</span>
        )}
      </div>
    </article>
  );
}

export default ChatMessageItem;
