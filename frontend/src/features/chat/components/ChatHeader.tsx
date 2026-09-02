import { practiceScenarios } from '../chat.constants';
import type { ScenarioKey } from '../chat.types';
import {
  EndSessionIcon,
  NewChatIcon,
  SparkIcon,
} from '../../../shared/Icons';

interface ChatHeaderProps {
  selectedScenarioKey: ScenarioKey;
  customTopic: string;
  hasMessages: boolean;
  onSelectScenario: (key: ScenarioKey) => void;
  onChangeCustomTopic: (value: string) => void;
  onNewConversation: () => void;
  canEndSession: boolean;
  isSummarizing: boolean;
  onEndSession: () => void;
}

function ChatHeader({
  selectedScenarioKey,
  customTopic,
  hasMessages,
  onSelectScenario,
  onChangeCustomTopic,
  onNewConversation,
  canEndSession,
  isSummarizing,
  onEndSession,
}: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="brand" aria-label="SpeakMentor AI">
        <span className="brand-mark">
          <SparkIcon size={23} />
        </span>
        <span>
          <strong>SpeakMentor</strong>
          <small>AI English coach</small>
        </span>
      </div>

      <div className="topic-controls">
        <label className="field-label" htmlFor="practice-topic">
          练习主题
        </label>
        <select
          id="practice-topic"
          className="topic-select"
          value={selectedScenarioKey}
          onChange={(event) =>
            onSelectScenario(event.target.value as ScenarioKey)
          }
        >
          {practiceScenarios.map((scenario) => (
            <option value={scenario.key} key={scenario.key}>
              {scenario.label} · {scenario.englishLabel}
            </option>
          ))}
        </select>
        {selectedScenarioKey === 'custom' && (
          <input
            className="custom-topic-input"
            value={customTopic}
            maxLength={80}
            placeholder="例如：Presenting a product idea"
            aria-label="自定义练习主题"
            onChange={(event) => onChangeCustomTopic(event.target.value)}
          />
        )}
      </div>

      <div className="header-actions">
        <button
          className="secondary-button"
          type="button"
          disabled={!hasMessages}
          onClick={onNewConversation}
        >
          <NewChatIcon />
          <span>新对话</span>
        </button>
        <button
          className="end-session-button"
          type="button"
          disabled={!canEndSession || isSummarizing}
          onClick={onEndSession}
        >
          <EndSessionIcon />
          <span>{isSummarizing ? '总结中…' : '结束会话'}</span>
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;
