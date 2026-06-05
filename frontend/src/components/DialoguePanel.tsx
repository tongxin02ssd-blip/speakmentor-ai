import { Card, Empty, Space, Tag, Typography } from 'antd';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

function DialoguePanel() {
  return (
    <Card
      className="dialogue-card"
      title="AI 对话记录"
      extra={<Tag color="processing">Waiting</Tag>}
    >
      <div className="dialogue-placeholder">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="开始练习后，对话内容会展示在这里"
        />
      </div>

      <div className="demo-message-list">
        <div className="message-row user-message">
          <div className="message-avatar">
            <UserOutlined />
          </div>

          <div className="message-bubble">
            <Text className="message-role">You</Text>
            <Paragraph className="message-text">
              Your recognized speech will appear here.
            </Paragraph>
          </div>
        </div>

        <div className="message-row ai-message">
          <div className="message-avatar">
            <RobotOutlined />
          </div>

          <div className="message-bubble">
            <Text className="message-role">SpeakMentor AI</Text>
            <Paragraph className="message-text">
              AI replies, corrections and speaking suggestions will appear here.
            </Paragraph>
          </div>
        </div>
      </div>

      <div className="latency-bar">
        <Space size={16} wrap>
          <Text>识别耗时：-- ms</Text>
          <Text>AI 回复耗时：-- ms</Text>
          <Text>端到端耗时：-- ms</Text>
        </Space>
      </div>
    </Card>
  );
}

export default DialoguePanel;