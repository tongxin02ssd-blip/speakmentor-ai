import { Layout, Typography } from 'antd';
import AppHeader from './components/AppHeader';
import DialoguePanel from './components/DialoguePanel';
import FeedbackPanel from './components/FeedbackPanel';
import ScenarioPanel from './components/ScenarioPanel';
import VoiceInputPanel from './components/VoiceInputPanel';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function App() {
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
            <ScenarioPanel />
            <VoiceInputPanel />
          </aside>

          <main className="center-column">
            <DialoguePanel />
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