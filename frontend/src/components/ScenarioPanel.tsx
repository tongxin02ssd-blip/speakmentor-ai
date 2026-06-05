import { Card, Space, Tag, Typography } from 'antd';
import {
  BankOutlined,
  CoffeeOutlined,
  MessageOutlined,
  EditOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const scenarios = [
  {
    key: 'interview',
    title: '面试场景',
    description: '模拟英文自我介绍、项目经历和行为面试问答。',
    icon: <BankOutlined />,
  },
  {
    key: 'restaurant',
    title: '点餐场景',
    description: '练习餐厅点餐、询问推荐和表达偏好。',
    icon: <CoffeeOutlined />,
  },
  {
    key: 'meeting',
    title: '会议场景',
    description: '练习会议发言、表达观点和回应同事问题。',
    icon: <MessageOutlined />,
  },
  {
    key: 'custom',
    title: '自定义场景',
    description: '后续支持输入自己的练习主题。',
    icon: <EditOutlined />,
  },
];

function ScenarioPanel() {
  return (
    <Card
      className="panel-card"
      title="场景选择"
      extra={<Tag color="blue">PR 3 接入交互</Tag>}
    >
      <Paragraph className="panel-description">
        先选择一个真实交流场景，后续 AI 会根据场景生成更自然的英文回复。
      </Paragraph>

      <div className="scenario-list">
        {scenarios.map((scenario) => (
          <div className="scenario-item" key={scenario.key}>
            <Space align="start" size={12}>
              <div className="scenario-icon">{scenario.icon}</div>

              <div>
                <Text className="scenario-title">{scenario.title}</Text>
                <Paragraph className="scenario-description">
                  {scenario.description}
                </Paragraph>
              </div>
            </Space>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default ScenarioPanel;