import { Button, Card, Col, Layout, Row, Space, Tag, Typography } from 'antd';
import { AudioOutlined, RobotOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

function App() {
  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div>
          <Text className="brand">SpeakMentor AI</Text>
          <Text className="slogan">
            Practice English in real conversations with AI.
          </Text>
        </div>
      </Header>

      <Content className="app-content">
        <section className="hero-section">
          <Space direction="vertical" size={16}>
            <Tag color="blue">AI Speaking Practice</Tag>

            <Title level={1} className="hero-title">
              场景化英语口语陪练助手
            </Title>

            <Paragraph className="hero-description">
              选择真实场景，通过语音与 AI 进行英文对话，并获得表达纠错、
              发音反馈和课后总结报告。
            </Paragraph>

            <Space>
              <Button type="primary" size="large" icon={<AudioOutlined />}>
                开始练习
              </Button>

              <Button size="large">查看项目说明</Button>
            </Space>
          </Space>
        </section>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card className="feature-card" title="场景选择">
              <Paragraph>
                后续将支持面试、点餐、会议和自定义场景。
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="feature-card" title="AI 语音对话">
              <Paragraph>
                后续将接入语音识别、AI 回复和语音播报能力。
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="feature-card" title="练习反馈">
              <Paragraph>
                后续将展示语法纠错、自然表达建议和量化评分。
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Card className="status-card">
          <Space>
            <RobotOutlined />
            <Text>
              当前状态：项目初始化完成，后续功能将通过多个 PR 持续开发。
            </Text>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}

export default App;