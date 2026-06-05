import { useMemo, useState } from 'react';
import { Layout, Typography } from 'antd';
import AppHeader from './components/AppHeader';
import DialoguePanel from './components/DialoguePanel';
import FeedbackPanel from './components/FeedbackPanel';
import ScenarioPanel from './components/ScenarioPanel';
import VoiceInputPanel from './components/VoiceInputPanel';
import { practiceScenarios } from './constants/scenarios';
import type { ScenarioKey } from './types/practice';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  const [selectedScenarioKey, setSelectedScenarioKey] =
    useState<ScenarioKey>('interview');
  const [customScenario, setCustomScenario] = useState('');

  const selectedScenario = useMemo(() => {
    return practiceScenarios.find(
      (scenario) => scenario.key === selectedScenarioKey,
    );
  }, [selectedScenarioKey]);

  const activeScenarioName =
    selectedScenarioKey === 'custom' && customScenario.trim()
      ? customScenario.trim()
      : selectedScenario?.title ?? '未选择场景';

  return (
    <Layout className="app-shell">
      <AppHeader />

      <Content className="app-main">
        <section className="intro-section">
          <div>
            <Title level={1} className="intro-title">
              场景化英语口语陪练助手
            </Title>

            <Paragraph className="intro-description">
              选择真实交流场景，通过语音与 AI 进行英文对话，并获得表达纠错、
              发音反馈、量化评分和课后总结报告。
            </Paragraph>
          </div>
        </section>

        <section className="workspace">
          <aside className="left-column">
            <ScenarioPanel
              selectedScenarioKey={selectedScenarioKey}
              customScenario={customScenario}
              onSelectScenario={setSelectedScenarioKey}
              onChangeCustomScenario={setCustomScenario}
            />

            <VoiceInputPanel activeScenarioName={activeScenarioName} />
          </aside>

          <main className="center-column">
            <DialoguePanel activeScenarioName={activeScenarioName} />
          </main>

          <aside className="right-column">
            <FeedbackPanel />
          </aside>
        </section>
      </Content>
    </Layout>
  );
}

export default App;