import { Button, Card, Space, Tag, Typography } from 'antd';
import { AudioOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

function VoiceInputPanel() {
  return (
    <Card className="panel-card" title="语音输入">
      <div className="voice-panel">
        <div className="voice-status">
          <div className="voice-circle">
            <AudioOutlined />
          </div>

          <Space direction="vertical" size={4} align="center">
            <Text className="voice-title">准备开始口语练习</Text>
            <Text className="voice-subtitle">
              语音识别功能将在后续 PR 接入
            </Text>
          </Space>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<AudioOutlined />}
          block
          disabled
        >
          开始说话
        </Button>

        <div className="recognition-box">
          <Space size={8}>
            <LoadingOutlined />
            <Text>等待语音输入...</Text>
          </Space>

          <Paragraph className="recognition-placeholder">
            后续这里会展示用户说出的英文文本，例如：
            “I would like to introduce my frontend project.”
          </Paragraph>
        </div>

        <Space wrap>
          <Tag>ASR</Tag>
          <Tag>MediaRecorder</Tag>
          <Tag>Fallback Mock</Tag>
        </Space>
      </div>
    </Card>
  );
}

export default VoiceInputPanel;