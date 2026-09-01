import { Alert, Button, Card, Empty, Space, Tag, Tooltip, Typography } from 'antd';
import {
  LoadingOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type {
  AiReplyStatus,
  DialogueMessage,
  DialogueMode,
  TtsStatus,
} from '../types/practice';

const { Text, Paragraph } = Typography;

interface DialoguePanelProps {
  activeScenarioName: string;
  messages: DialogueMessage[];
  aiReplyStatus: AiReplyStatus;
  aiReplyError: string;
  dialogueMode: DialogueMode;
  apiNotice: string;
  ttsStatus: TtsStatus;
  speakingMessageId: string | null;
  ttsError: string;
  isTextToSpeechSupported: boolean;
  onSpeakMessage: (message: DialogueMessage) => void;
  onStopSpeaking: () => void;
}

const formatMessageTime = (value: string) => {
  return new Date(value).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const dialogueModeTextMap: Record<Exclude<DialogueMode, null>, string> = {
  'backend-ai': 'Backend AI',
  'backend-mock': 'Backend Mock',
  'frontend-mock': 'Frontend Mock',
};

const dialogueModeColorMap: Record<Exclude<DialogueMode, null>, string> = {
  'backend-ai': 'green',
  'backend-mock': 'blue',
  'frontend-mock': 'orange',
};

function DialoguePanel({
  activeScenarioName,
  messages,
  aiReplyStatus,
  aiReplyError,
  dialogueMode,
  apiNotice,
  ttsStatus,
  speakingMessageId,
  ttsError,
  isTextToSpeechSupported,
  onSpeakMessage,
  onStopSpeaking,
}: DialoguePanelProps) {
  const latestLatency = [...messages]
    .reverse()
    .find((message) => message.latency)?.latency;

  const isAiThinking = aiReplyStatus === 'thinking';

  return (
    <Card
      className="dialogue-card"
      title="AI 对话记录"
      extra={
        <Space wrap>
          {isAiThinking && <Tag color="processing">AI Thinking</Tag>}

          {dialogueMode && (
            <Tag color={dialogueModeColorMap[dialogueMode]}>
              {dialogueModeTextMap[dialogueMode]}
            </Tag>
          )}

          {ttsStatus === 'speaking' && <Tag color="green">Speaking</Tag>}

          <Tag color={isTextToSpeechSupported ? 'green' : 'orange'}>
            {isTextToSpeechSupported ? 'TTS Ready' : 'TTS Limited'}
          </Tag>

          <Tag color="processing">{activeScenarioName}</Tag>
        </Space>
      }
    >
      {messages.length === 0 && !isAiThinking ? (
        <div className="dialogue-placeholder">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="开始练习后，对话内容会展示在这里"
          />
        </div>
      ) : (
        <div className="dialogue-message-list">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const isAssistant = message.role === 'assistant';
            const isCurrentSpeaking = speakingMessageId === message.id;

            return (
              <div
                className={`message-row ${
                  isUser ? 'user-message' : 'ai-message'
                }`}
                key={message.id}
              >
                <div className="message-avatar">
                  {isUser ? <UserOutlined /> : <RobotOutlined />}
                </div>

                <div className="message-content">
                  <div className="message-meta">
                    <Text className="message-role">
                      {isUser ? 'You' : 'SpeakMentor AI'}
                    </Text>

                    <Text className="message-time">
                      {formatMessageTime(message.createdAt)}
                    </Text>

                    {isAssistant && (
                      <Tooltip
                        title={
                          isCurrentSpeaking
                            ? '停止播报'
                            : '播放 AI 英文回复'
                        }
                      >
                        <Button
                          className="tts-button"
                          type="text"
                          size="small"
                          icon={
                            isCurrentSpeaking ? (
                              <PauseCircleOutlined />
                            ) : (
                              <PlayCircleOutlined />
                            )
                          }
                          disabled={!isTextToSpeechSupported}
                          onClick={() => {
                            if (isCurrentSpeaking) {
                              onStopSpeaking();
                              return;
                            }

                            onSpeakMessage(message);
                          }}
                        />
                      </Tooltip>
                    )}
                  </div>

                  <div
                    className={`message-bubble ${
                      isCurrentSpeaking ? 'message-bubble-speaking' : ''
                    }`}
                  >
                    <Paragraph className="message-text">
                      {message.content}
                    </Paragraph>
                  </div>
                </div>
              </div>
            );
          })}

          {isAiThinking && (
            <div className="message-row ai-message">
              <div className="message-avatar">
                <RobotOutlined />
              </div>

              <div className="message-content">
                <div className="message-meta">
                  <Text className="message-role">SpeakMentor AI</Text>
                  <Text className="message-time">thinking</Text>
                </div>

                <div className="message-bubble thinking-bubble">
                  <Space>
                    <LoadingOutlined />
                    <Text>AI 正在请求后端生成英文回复...</Text>
                  </Space>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {apiNotice && (
        <Alert
          className="dialogue-alert"
          type="info"
          showIcon
          message={apiNotice}
        />
      )}

      {aiReplyError && (
        <Alert
          className="dialogue-alert"
          type="error"
          showIcon
          message={aiReplyError}
        />
      )}

      {ttsError && (
        <Alert
          className="dialogue-alert"
          type="error"
          showIcon
          message={ttsError}
        />
      )}

      {!isTextToSpeechSupported && (
        <Alert
          className="dialogue-alert"
          type="warning"
          showIcon
          message="当前浏览器不支持 AI 回复语音播报"
          description="建议使用 Chrome 或 Edge 浏览器进行演示；即使不支持 TTS，也不会影响对话和反馈主流程。"
        />
      )}

      <div className="latency-bar">
        {latestLatency ? (
          <Space size={12} wrap>
            <div className="latency-item">
              <Text className="latency-label">识别耗时</Text>
              <Text className="latency-value">{latestLatency.asrMs} ms</Text>
            </div>

            <div className="latency-item">
              <Text className="latency-label">AI 回复耗时</Text>
              <Text className="latency-value">{latestLatency.aiMs} ms</Text>
            </div>

            <div className="latency-item">
              <Text className="latency-label">端到端耗时</Text>
              <Text className="latency-value">{latestLatency.totalMs} ms</Text>
            </div>
          </Space>
        ) : (
          <Space size={16} wrap>
            <Text>识别耗时：-- ms</Text>
            <Text>AI 回复耗时：-- ms</Text>
            <Text>端到端耗时：-- ms</Text>
          </Space>
        )}
      </div>
    </Card>
  );
}

export default DialoguePanel;