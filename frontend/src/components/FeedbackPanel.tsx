import { Card, Divider, Empty, Progress, Space, Tag, Typography } from 'antd';

const { Text, Paragraph } = Typography;

function FeedbackPanel() {
  return (
    <div className="feedback-column">
      <Card className="panel-card" title="表达纠错">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="完成一轮对话后展示纠错建议"
        />

        <div className="feedback-preview">
          <Text className="feedback-label">更自然表达</Text>
          <Paragraph className="feedback-placeholder">
            后续这里会展示更地道的英文表达建议。
          </Paragraph>
        </div>
      </Card>

      <Card className="panel-card" title="量化评分">
        <Space direction="vertical" size={14} className="score-list">
          <div>
            <div className="score-row">
              <Text>流畅度</Text>
              <Text type="secondary">--</Text>
            </div>
            <Progress percent={0} showInfo={false} />
          </div>

          <div>
            <div className="score-row">
              <Text>准确度</Text>
              <Text type="secondary">--</Text>
            </div>
            <Progress percent={0} showInfo={false} />
          </div>

          <div>
            <div className="score-row">
              <Text>表达自然度</Text>
              <Text type="secondary">--</Text>
            </div>
            <Progress percent={0} showInfo={false} />
          </div>

          <div>
            <div className="score-row">
              <Text>场景完成度</Text>
              <Text type="secondary">--</Text>
            </div>
            <Progress percent={0} showInfo={false} />
          </div>
        </Space>
      </Card>

      <Card className="panel-card" title="课后总结">
        <Paragraph className="panel-description">
          练习结束后，将生成本次对话总结、常见错误、优化建议和综合评分。
        </Paragraph>

        <Divider />

        <Space wrap>
          <Tag>Summary</Tag>
          <Tag>Export</Tag>
          <Tag>Report</Tag>
        </Space>
      </Card>
    </div>
  );
}

export default FeedbackPanel;