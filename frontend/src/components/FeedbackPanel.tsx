import {
  Alert,
  Card,
  Divider,
  Empty,
  Progress,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import {
  BulbOutlined,
  CheckCircleOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import type {
  DialogueTurnFeedback,
  FeedbackStatus,
} from '../types/practice';

const { Text, Paragraph } = Typography;

interface FeedbackPanelProps {
  feedbackStatus: FeedbackStatus;
  latestFeedback: DialogueTurnFeedback | null;
  feedbackError: string;
}

function FeedbackPanel({
  feedbackStatus,
  latestFeedback,
  feedbackError,
}: FeedbackPanelProps) {
  const isGenerating = feedbackStatus === 'generating';

  return (
    <div className="feedback-column">
      <Card className="panel-card" title="表达纠错">
        {feedbackStatus === 'idle' && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="完成一轮对话后展示纠错建议"
          />
        )}

        {isGenerating && (
          <div className="feedback-loading">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        )}

        {feedbackStatus === 'error' && feedbackError && (
          <Alert type="error" showIcon message={feedbackError} />
        )}

        {latestFeedback && feedbackStatus === 'success' && (
          <Space direction="vertical" size={16} className="feedback-detail">
            <div className="feedback-block">
              <Text className="feedback-label">用户原句</Text>
              <Paragraph className="feedback-original">
                {latestFeedback.correction.originalText}
              </Paragraph>
            </div>

            <div className="feedback-block">
              <Text className="feedback-label">语法纠错</Text>
              <Paragraph className="feedback-corrected">
                {latestFeedback.correction.correctedText}
              </Paragraph>
            </div>

            <div className="feedback-block feedback-highlight-block">
              <Text className="feedback-label">更自然表达</Text>
              <Paragraph className="feedback-natural">
                {latestFeedback.correction.naturalExpression}
              </Paragraph>
            </div>

            <div className="feedback-block">
              <Text className="feedback-label">中文解释</Text>
              <Paragraph className="feedback-explanation">
                {latestFeedback.correction.explanation}
              </Paragraph>
            </div>

            <div className="feedback-block">
              <Text className="feedback-label">关键学习点</Text>

              <div className="key-point-list">
                {latestFeedback.correction.keyPoints.map((point) => (
                  <div className="key-point-item" key={point}>
                    <CheckCircleOutlined />
                    <Text>{point}</Text>
                  </div>
                ))}
              </div>
            </div>
          </Space>
        )}
      </Card>

      <Card className="panel-card" title="发音与流畅度">
        {!latestFeedback || feedbackStatus === 'idle' ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="完成一轮对话后展示发音建议"
          />
        ) : isGenerating ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          <Space direction="vertical" size={14} className="pronunciation-list">
            <div className="pronunciation-item">
              <SoundOutlined />
              <div>
                <Text className="pronunciation-title">流畅度</Text>
                <Paragraph className="pronunciation-text">
                  {latestFeedback.pronunciation.fluencyComment}
                </Paragraph>
              </div>
            </div>

            <div className="pronunciation-item">
              <SoundOutlined />
              <div>
                <Text className="pronunciation-title">发音清晰度</Text>
                <Paragraph className="pronunciation-text">
                  {latestFeedback.pronunciation.pronunciationComment}
                </Paragraph>
              </div>
            </div>

            <div className="pronunciation-item">
              <BulbOutlined />
              <div>
                <Text className="pronunciation-title">提升建议</Text>
                <Paragraph className="pronunciation-text">
                  {latestFeedback.pronunciation.improvementTip}
                </Paragraph>
              </div>
            </div>
          </Space>
        )}
      </Card>

      <Card className="panel-card" title="量化评分">
        <Space direction="vertical" size={14} className="score-list">
          <div>
            <div className="score-row">
              <Text>流畅度</Text>
              <Text type="secondary">
                {latestFeedback ? latestFeedback.score.fluency : '--'}
              </Text>
            </div>
            <Progress
              percent={latestFeedback?.score.fluency ?? 0}
              showInfo={false}
            />
          </div>

          <div>
            <div className="score-row">
              <Text>准确度</Text>
              <Text type="secondary">
                {latestFeedback ? latestFeedback.score.accuracy : '--'}
              </Text>
            </div>
            <Progress
              percent={latestFeedback?.score.accuracy ?? 0}
              showInfo={false}
            />
          </div>

          <div>
            <div className="score-row">
              <Text>表达自然度</Text>
              <Text type="secondary">
                {latestFeedback ? latestFeedback.score.naturalness : '--'}
              </Text>
            </div>
            <Progress
              percent={latestFeedback?.score.naturalness ?? 0}
              showInfo={false}
            />
          </div>

          <div>
            <div className="score-row">
              <Text>场景完成度</Text>
              <Text type="secondary">
                {latestFeedback ? latestFeedback.score.scenarioCompletion : '--'}
              </Text>
            </div>
            <Progress
              percent={latestFeedback?.score.scenarioCompletion ?? 0}
              showInfo={false}
            />
          </div>
        </Space>

        {latestFeedback && (
          <>
            <Divider />

            <div className="overall-score-card">
              <Text className="overall-score-label">综合评分</Text>
              <Text className="overall-score-value">
                {latestFeedback.score.overall}
              </Text>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default FeedbackPanel;