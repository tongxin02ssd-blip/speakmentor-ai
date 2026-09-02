import { ArrowDownIcon, SparkIcon } from '../../../shared/Icons';
import { useAutoScroll } from '../hooks/useAutoScroll';
import type { ChatMessage } from '../chat.types';
import ChatMessageItem from './ChatMessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  topicName: string;
  topicDescription: string;
  speakingMessageId: string | null;
  canSpeak: boolean;
  onSpeak: (message: ChatMessage) => void;
  onStopSpeaking: () => void;
  isResponding: boolean;
  onStartConversation: () => void;
}

function MessageList({
  messages,
  topicName,
  topicDescription,
  speakingMessageId,
  canSpeak,
  onSpeak,
  onStopSpeaking,
  isResponding,
  onStartConversation,
}: MessageListProps) {
  const lastMessage = messages.at(-1);
  const changeSignal = `${messages.length}:${lastMessage?.content.length ?? 0}:${lastMessage?.status ?? ''}`;
  const { containerRef, isAwayFromBottom, onScroll, scrollToBottom } =
    useAutoScroll(changeSignal);

  return (
    <div className="message-list-wrap">
      <div
        className="message-list"
        ref={containerRef}
        onScroll={onScroll}
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <section className="empty-conversation">
            <span className="empty-icon">
              <SparkIcon size={30} />
            </span>
            <p className="eyebrow">YOUR ENGLISH PRACTICE SPACE</p>
            <h1>Let’s talk about {topicName}</h1>
            <p>{topicDescription}</p>
            <div className="empty-hint">
              输入一句英文，或点击麦克风转写。发送前你可以继续编辑。
            </div>
            <button
              className="start-button"
              type="button"
              disabled={isResponding}
              onClick={onStartConversation}
            >
              {isResponding ? 'Starting…' : 'Start conversation'}
            </button>
          </section>
        ) : (
          <div className="message-column">
            {messages.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                isSpeaking={speakingMessageId === message.id}
                canSpeak={canSpeak}
                onSpeak={onSpeak}
                onStopSpeaking={onStopSpeaking}
              />
            ))}
          </div>
        )}
      </div>

      {isAwayFromBottom && (
        <button
          className="jump-to-bottom"
          type="button"
          onClick={() => scrollToBottom()}
        >
          <ArrowDownIcon />
          回到最新消息
        </button>
      )}
    </div>
  );
}

export default MessageList;
