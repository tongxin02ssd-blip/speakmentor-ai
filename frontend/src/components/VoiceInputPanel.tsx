import { Alert, Button, Card, Space, Tag, Typography } from 'antd';
import {
  AudioOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type {
  RecognitionSource,
  RecognitionStatus,
} from '../types/practice';

const { Text, Paragraph } = Typography;

interface VoiceInputPanelProps {
  activeScenarioName: string;
  recognitionStatus: RecognitionStatus;
  recognitionSource: RecognitionSource;
  recognizedText: string;
  recognitionError: string;
  recognitionNotice: string;
  lastAsrMs: number | null;
  isSpeechRecognitionSupported: boolean;
  onStartBrowserRecognition: () => void;
  onStartMockRecognition: () => void;
}

function VoiceInputPanel({
  activeScenarioName,
  recognitionStatus,
  recognitionSource,
  recognizedText,
  recognitionError,
  recognitionNotice,
  lastAsrMs,
  isSpeechRecognitionSupported,
  onStartBrowserRecognition,
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
    idle: '可以使用真实语音识别，也可以使用 Mock ASR 稳定演示',
    recognizing: '请用英文说一句话，或等待 Mock ASR 返回结果',
    success: '识别结果已追加到 AI 对话记录',
    error: '请重新尝试，或使用 Mock 数据继续演示',
  };

  const sourceLabelMap: Record<Exclude<RecognitionSource, null>, string> = {
    browser: 'Browser Speech',
    mock: 'Mock ASR',
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

        <Space direction="vertical" size={10} className="voice-action-group">
          <Button
            type="primary"
            size="large"
            icon={isRecognizing ? <LoadingOutlined /> : <AudioOutlined />}
            block
            loading={isRecognizing}
            disabled={isRecognizing}
            onClick={onStartBrowserRecognition}
          >
            {isRecognizing ? '识别中...' : '开始真实语音'}
          </Button>

          <Button
            size="large"
            block
            disabled={isRecognizing}
            onClick={onStartMockRecognition}
          >
            使用 Mock 演示
          </Button>
        </Space>

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
              点击“开始真实语音”后，浏览器会尝试识别你的英文表达；如果失败，
              系统会自动切换到 Mock ASR。
            </Paragraph>
          )}
        </div>

        {!isSpeechRecognitionSupported && (
          <Alert
            type="warning"
            showIcon
            message="当前浏览器可能不支持真实语音识别"
            description="建议 demo 时使用 Chrome 浏览器；不支持时仍可通过 Mock ASR 完整演示。"
          />
        )}

        {recognitionNotice && (
          <Alert type="info" showIcon message={recognitionNotice} />
        )}

        {recognitionError && (
          <Alert type="error" showIcon message={recognitionError} />
        )}

        {recognitionStatus === 'success' && (
          <Alert
            type="success"
            showIcon
            message="识别成功"
            description="识别结果已生成用户英文表达，并追加到中间的 AI 对话记录中。"
          />
        )}

        <Space wrap>
          <Tag color={isSpeechRecognitionSupported ? 'green' : 'orange'}>
            {isSpeechRecognitionSupported ? 'Browser ASR Ready' : 'Browser ASR Limited'}
          </Tag>

          <Tag color="blue">Mock Fallback</Tag>

          {recognitionSource && (
            <Tag color="processing">
              Source: {sourceLabelMap[recognitionSource]}
            </Tag>
          )}
        </Space>
      </div>
    </Card>
  );
}

export default VoiceInputPanel;