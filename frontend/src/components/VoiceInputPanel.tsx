import { Alert, Button, Card, Space, Tag, Typography } from 'antd';
import {
  AudioOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { RecognitionStatus } from '../types/practice';

const { Text, Paragraph } = Typography;

interface VoiceInputPanelProps {
  activeScenarioName: string;   //当前练习场景名，比如“面试场景”
  recognitionStatus: RecognitionStatus;   //当前识别状态
  recognizedText: string;     //识别出来的英文文本
  recognitionError: string;     //出错时要显示的错误信息
  lastAsrMs: number | null;     //最近一次识别耗时
  onStartMockRecognition: () => void;   //用户点击“开始说话”时要执行的函数
}

function VoiceInputPanel({
  activeScenarioName,
  recognitionStatus,
  recognizedText,
  recognitionError,
  lastAsrMs,
  onStartMockRecognition,
}: VoiceInputPanelProps) {
  const isRecognizing = recognitionStatus === 'recognizing';

  const statusTextMap: Record<RecognitionStatus, string> = {
    idle: '准备开始口语练习',
    recognizing: '正在识别你的英文表达...',
    success: '语音识别完成',
    error: '语音识别失败',
  };

  const subtitleTextMap: Record<RecognitionStatus, string> = {
    idle: '当前使用 Mock ASR，后续 PR 会接入真实语音识别',
    recognizing: '请稍等，系统正在模拟语音识别流程',
    success: '识别结果已追加到 AI 对话记录',
    error: '请重新尝试，或使用 Mock 数据继续演示',
  };

  return (
    <Card className="panel-card" title="语音输入">
      <div className="voice-panel">
        <div className="current-scenario-card">
          <Text className="current-scenario-label">当前练习场景</Text>
          <Text className="current-scenario-name">{activeScenarioName}</Text>
        </div>

        <div className={`voice-status voice-status-${recognitionStatus}`}>
          <div className="voice-circle">
            {isRecognizing ? <LoadingOutlined /> : <AudioOutlined />}
          </div>

          <Space direction="vertical" size={4} align="center">
            <Text className="voice-title">{statusTextMap[recognitionStatus]}</Text>
            <Text className="voice-subtitle">
              {subtitleTextMap[recognitionStatus]}
            </Text>
          </Space>
        </div>

        <Button
          type="primary"
          size="large"
          icon={isRecognizing ? <LoadingOutlined /> : <AudioOutlined />}
          block
          loading={isRecognizing}
          disabled={isRecognizing}
          onClick={onStartMockRecognition}
        >
          {isRecognizing ? '识别中...' : '开始说话'}
        </Button>

        <div className="recognition-box">
          <Space size={8}>
            {recognitionStatus === 'success' ? (
              <CheckCircleOutlined className="success-icon" />
            ) : (
              <ClockCircleOutlined />
            )}

            <Text>
              {lastAsrMs ? `识别耗时：${lastAsrMs} ms` : '等待语音输入...'}
            </Text>
          </Space>

          {recognizedText ? (
            <Paragraph className="recognition-result">
              “{recognizedText}”
            </Paragraph>
          ) : (
            <Paragraph className="recognition-placeholder">
              点击“开始说话”后，将通过 Mock ASR 生成一段英文识别文本。
            </Paragraph>
          )}
        </div>

        {recognitionError && (
          <Alert type="error" showIcon message={recognitionError} />
        )}

        {recognitionStatus === 'success' && (
          <Alert
            type="success"
            showIcon
            message="识别成功"
            description="Mock ASR 已生成用户英文表达，并追加到中间的 AI 对话记录中。"
          />
        )}

        <Space wrap>
          <Tag color="blue">Mock ASR</Tag>
          <Tag>Web Speech API Later</Tag>
          <Tag>Fallback Ready</Tag>
        </Space>
      </div>
    </Card>
  );
}

export default VoiceInputPanel;