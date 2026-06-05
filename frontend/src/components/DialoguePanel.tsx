import { Card, Empty, Space, Tag, Typography } from 'antd';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import type { DialogueMessage } from '../types/practice';

const { Text, Paragraph } = Typography;

interface DialoguePanelProps {
  activeScenarioName: string;
  messages: DialogueMessage[];
}

const formatMessageTime = (value: string) => {
  return new Date(value).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

function DialoguePanel({ activeScenarioName, messages }: DialoguePanelProps) {
  const latestLatency = [...messages]
    .reverse()
    .find((message) => message.latency)?.latency;

  return (
    <Card
      className="dialogue-card"
      title="AI 对话记录"
      extra={<Tag color="processing">{activeScenarioName}</Tag>}
    >
      {messages.length === 0 ? (
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
                  </div>

                  <div className="message-bubble">
                    <Paragraph className="message-text">
                      {message.content}
                    </Paragraph>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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