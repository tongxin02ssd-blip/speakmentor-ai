import { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, Typography } from 'antd';
import AppHeader from './components/AppHeader';
import DialoguePanel from './components/DialoguePanel';
import FeedbackPanel from './components/FeedbackPanel';
import ScenarioPanel from './components/ScenarioPanel';
import VoiceInputPanel from './components/VoiceInputPanel';
import { practiceScenarios } from './constants/scenarios';
import { createMockAsrResult } from './mocks';
import type {
  DialogueMessage,
  RecognitionStatus,
  ScenarioKey,
} from './types/practice';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  const [selectedScenarioKey, setSelectedScenarioKey] =
    useState<ScenarioKey>('interview');
  const [customScenario, setCustomScenario] = useState('');
  // 中间对话区真正显示的消息列表
  const [messages, setMessages] = useState<DialogueMessage[]>([]);

  // 当前识别流程状态：idle / recognizing / success / error
  const [recognitionStatus, setRecognitionStatus] =
    useState<RecognitionStatus>('idle');

  // 本次识别出来的英文文本
  const [recognizedText, setRecognizedText] = useState('');

  // 如果识别失败，要显示的错误信息
  const [recognitionError, setRecognitionError] = useState('');

  // 最近一次识别耗时
  const [lastAsrMs, setLastAsrMs] = useState<number | null>(null);

  const recognitionTimerRef = useRef<number | null>(null);

  const selectedScenario = useMemo(() => {
    return practiceScenarios.find(
      (scenario) => scenario.key === selectedScenarioKey,
    );
  }, [selectedScenarioKey]);

  const activeScenarioName =
    selectedScenarioKey === 'custom' && customScenario.trim()
      ? customScenario.trim()
      : selectedScenario?.title ?? '未选择场景';

  // 作用是：
  // 如果之前已经点过一次“开始说话”，但那次 mock 识别还没完成，
  // 现在又切场景或再次点击。
  // 那就先把旧的定时任务取消掉，避免旧结果晚一点回来，把新状态冲掉。
  const clearRecognitionTimer = () => {
    if (recognitionTimerRef.current) {
      window.clearTimeout(recognitionTimerRef.current);
      recognitionTimerRef.current = null;
    }
  };

  // 切场景时顺手清空练习状态
  const resetPracticeState = () => {
    clearRecognitionTimer();
    setMessages([]);
    setRecognitionStatus('idle');
    setRecognizedText('');
    setRecognitionError('');
    setLastAsrMs(null);
  };

  const handleSelectScenario = (scenarioKey: ScenarioKey) => {
    setSelectedScenarioKey(scenarioKey);
    resetPracticeState();
  };

  const handleStartMockRecognition = () => {
    // 开始识别前，先清现场
    clearRecognitionTimer();

    setRecognitionStatus('recognizing');
    setRecognizedText('');
    setRecognitionError('');
    setLastAsrMs(null);

    // 用 setTimeout 模拟识别耗时
    recognitionTimerRef.current = window.setTimeout(() => {
      try {
        const mockResult = createMockAsrResult({
          scenarioKey: selectedScenarioKey,
          scenarioName: activeScenarioName,
        });

        setRecognizedText(mockResult.recognizedText);
        setLastAsrMs(mockResult.latency.asrMs);
        setMessages((prevMessages) => [
          ...prevMessages,
          mockResult.userMessage,
        ]);
        setRecognitionStatus('success');
      } catch {
        setRecognitionStatus('error');
        setRecognitionError('Mock ASR 识别失败，请重新尝试。');
      } finally {
        recognitionTimerRef.current = null;
      }
    }, 900);
  };

  useEffect(() => {
    return () => {
      clearRecognitionTimer();
    };
  }, []);

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
              onSelectScenario={handleSelectScenario}
              onChangeCustomScenario={setCustomScenario}
            />

            <VoiceInputPanel
              activeScenarioName={activeScenarioName}
              recognitionStatus={recognitionStatus}
              recognizedText={recognizedText}
              recognitionError={recognitionError}
              lastAsrMs={lastAsrMs}
              onStartMockRecognition={handleStartMockRecognition}
            />
          </aside>

          <main className="center-column">
            <DialoguePanel
              activeScenarioName={activeScenarioName}
              messages={messages}
            />
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