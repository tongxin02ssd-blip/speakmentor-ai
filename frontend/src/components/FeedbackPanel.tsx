import {
  Alert,
  Card,
  Divider,
  Empty,
  Progress,
  Skeleton,
  Space,
  Tag,
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
import {
  createScoreDimensions,
  getScoreLevel,
  getScoreLevelDescription,
  getScoreLevelText,
  getScoreTagColor,
} from '../utils/score';

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
  const score = latestFeedback?.score;
  const scoreLevel = score ? getScoreLevel(score.overall) : null;
  const scoreDimensions = score ? createScoreDimensions(score) : [];

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
        {!score && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="完成一轮练习后展示量化评分"
          />
        )}

        {score && scoreLevel && (
          <>
            <div className="score-summary-card">
              <div>
                <Text className="score-summary-label">综合评分</Text>

                <div className="score-summary-main">
                  <Text className="score-summary-value">{score.overall}</Text>
                  <Text className="score-summary-total">/ 100</Text>
                </div>
              </div>

              <Tag color={getScoreTagColor(score.overall)}>
                {getScoreLevelText(scoreLevel)}
              </Tag>
            </div>

            <Paragraph className="score-summary-description">
              {getScoreLevelDescription(score.overall)}
            </Paragraph>

            <Divider />

            <Space direction="vertical" size={14} className="score-list">
              {scoreDimensions.map((dimension) => (
                <div className="score-dimension-card" key={dimension.key}>
                  <div className="score-row">
                    <div>
                      <Text className="score-dimension-title">
                        {dimension.label}
                      </Text>
                      <Paragraph className="score-dimension-description">
                        {dimension.description}
                      </Paragraph>
                    </div>

                    <Tag color={getScoreTagColor(dimension.value)}>
                      {dimension.value}
                    </Tag>
                  </div>

                  <Progress percent={dimension.value} showInfo={false} />
                </div>
              ))}
            </Space>
          </>
        )}
      </Card>
    </div>
  );
}

export default FeedbackPanel;