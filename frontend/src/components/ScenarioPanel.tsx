import type { ReactNode } from 'react';
import { Alert, Card, Input, Space, Tag, Typography } from 'antd';
import {
  BankOutlined,
  CoffeeOutlined,
  MessageOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { practiceScenarios } from '../constants/scenarios';
import type { ScenarioKey } from '../types/practice';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ScenarioPanelProps {
  selectedScenarioKey: ScenarioKey;
  customScenario: string;
  onSelectScenario: (scenarioKey: ScenarioKey) => void;
  onChangeCustomScenario: (value: string) => void;
}

const scenarioIcons: Record<ScenarioKey, ReactNode> = {
  interview: <BankOutlined />,
  restaurant: <CoffeeOutlined />,
  meeting: <MessageOutlined />,
  custom: <EditOutlined />,
};

function ScenarioPanel({
  selectedScenarioKey,
  customScenario,
  onSelectScenario,
  onChangeCustomScenario,
}: ScenarioPanelProps) {
  const selectedScenario = practiceScenarios.find(
    (scenario) => scenario.key === selectedScenarioKey,
  );

  const currentScenarioName =
    selectedScenarioKey === 'custom' && customScenario.trim()
      ? customScenario.trim()
      : selectedScenario?.title;

  return (
    <Card
      className="panel-card"
      title="场景选择"
      extra={<Tag color="blue">当前：{currentScenarioName}</Tag>}
    >
      <Paragraph className="panel-description">
        先选择一个真实交流场景，后续 AI 会根据场景生成更自然的英文回复。
      </Paragraph>

      <div className="scenario-list">
        {practiceScenarios.map((scenario) => {
          const isActive = scenario.key === selectedScenarioKey;

          return (
            <button
              type="button"
              className={`scenario-item ${isActive ? 'scenario-item-active' : ''}`}
              key={scenario.key}
              onClick={() => onSelectScenario(scenario.key)}
            >
              <Space align="start" size={12}>
                <div className="scenario-icon">{scenarioIcons[scenario.key]}</div>

                <div>
                  <Text className="scenario-title">{scenario.title}</Text>
                  <Text className="scenario-english-title">
                    {scenario.englishTitle}
                  </Text>
                  <Paragraph className="scenario-description">
                    {scenario.description}
                  </Paragraph>
                </div>
              </Space>
            </button>
          );
        })}
      </div>

      {selectedScenarioKey === 'custom' && (
        <div className="custom-scenario-box">
          <Text className="custom-scenario-label">自定义练习场景</Text>

          <TextArea
            value={customScenario}
            onChange={(event) => onChangeCustomScenario(event.target.value)}
            placeholder="例如：英文项目答辩、机场问路、客户沟通、和外国同事同步需求..."
            autoSize={{ minRows: 3, maxRows: 4 }}
            maxLength={80}
            showCount
          />

          <Alert
            className="custom-scenario-tip"
            type="info"
            showIcon
            message="后续 AI 会根据你输入的自定义场景生成对话。"
          />
        </div>
      )}
    </Card>
  );
}

export default ScenarioPanel;