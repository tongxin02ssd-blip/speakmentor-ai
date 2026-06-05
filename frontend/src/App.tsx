import { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, Typography } from 'antd';
import AppHeader from './components/AppHeader';
import DialoguePanel from './components/DialoguePanel';
import FeedbackPanel from './components/FeedbackPanel';
import ScenarioPanel from './components/ScenarioPanel';
import VoiceInputPanel from './components/VoiceInputPanel';
import { practiceScenarios } from './constants/scenarios';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { createMockAsrResult } from './mocks';
import type {
  DialogueMessage,
  LatencyMetrics,
  RecognitionSource,
  RecognitionStatus,
  ScenarioKey,
} from './types/practice';
import { createDialogueMessage } from './utils/message';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  const [selectedScenarioKey, setSelectedScenarioKey] =
    useState<ScenarioKey>('interview');
  const [customScenario, setCustomScenario] = useState('');
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [recognitionStatus, setRecognitionStatus] =
    useState<RecognitionStatus>('idle');
  const [recognitionSource, setRecognitionSource] =
    useState<RecognitionSource>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [recognitionError, setRecognitionError] = useState('');
  const [recognitionNotice, setRecognitionNotice] = useState('');
  const [lastAsrMs, setLastAsrMs] = useState<number | null>(null);

  const recognitionTimerRef = useRef<number | null>(null);

  const {
    isSupported: isSpeechRecognitionSupported,
    startRecognition,
    stopRecognition,
  } = useSpeechRecognition();

  const selectedScenario = useMemo(() => {
    return practiceScenarios.find(
      (scenario) => scenario.key === selectedScenarioKey,
    );
  }, [selectedScenarioKey]);

  const activeScenarioName =
    selectedScenarioKey === 'custom' && customScenario.trim()
      ? customScenario.trim()
      : selectedScenario?.title ?? '未选择场景';

  const clearRecognitionTimer = () => {
    if (recognitionTimerRef.current) {
      window.clearTimeout(recognitionTimerRef.current);
      recognitionTimerRef.current = null;
    }
  };

  const appendUserMessage = (
    text: string,
    latency: LatencyMetrics,
    source: Exclude<RecognitionSource, null>,
  ) => {
    const userMessage = createDialogueMessage({
      role: 'user',
      content: text,
      scenarioKey: selectedScenarioKey,
      scenarioName: activeScenarioName,
      latency,
    });

    setRecognizedText(text);
    setLastAsrMs(latency.asrMs);
    setRecognitionSource(source);
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setRecognitionStatus('success');
  };

  const resetPracticeState = () => {
    clearRecognitionTimer();
    stopRecognition();
    setMessages([]);
    setRecognitionStatus('idle');
    setRecognitionSource(null);
    setRecognizedText('');
    setRecognitionError('');
    setRecognitionNotice('');
    setLastAsrMs(null);
  };

  const handleSelectScenario = (scenarioKey: ScenarioKey) => {
    setSelectedScenarioKey(scenarioKey);
    resetPracticeState();
  };

  const prepareRecognition = () => {
    clearRecognitionTimer();
    setRecognitionStatus('recognizing');
    setRecognitionSource(null);
    setRecognizedText('');
    setRecognitionError('');
    setRecognitionNotice('');
    setLastAsrMs(null);
  };

  const startMockRecognitionFlow = (notice?: string) => {
    prepareRecognition();

    if (notice) {
      setRecognitionNotice(notice);
    }

    recognitionTimerRef.current = window.setTimeout(() => {
      try {
        const mockResult = createMockAsrResult({
          scenarioKey: selectedScenarioKey,
          scenarioName: activeScenarioName,
        });

        setRecognizedText(mockResult.recognizedText);
        setLastAsrMs(mockResult.latency.asrMs);
        setRecognitionSource('mock');
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

  const handleStartMockRecognition = () => {
    startMockRecognitionFlow();
  };

  const handleStartBrowserRecognition = async () => {
    if (!isSpeechRecognitionSupported) {
      startMockRecognitionFlow(
        '当前浏览器不支持真实语音识别，已自动切换到 Mock ASR。',
      );
      return;
    }

    prepareRecognition();

    try {
      const browserResult = await startRecognition();

      appendUserMessage(
        browserResult.recognizedText,
        browserResult.latency,
        'browser',
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '真实语音识别失败';

      startMockRecognitionFlow(
        `真实语音识别失败：${errorMessage}。已自动切换到 Mock ASR。`,
      );
    }
  };

  useEffect(() => {
    return () => {
      clearRecognitionTimer();
      stopRecognition();
    };
  }, [stopRecognition]);

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
              recognitionSource={recognitionSource}
              recognizedText={recognizedText}
              recognitionError={recognitionError}
              recognitionNotice={recognitionNotice}
              lastAsrMs={lastAsrMs}
              isSpeechRecognitionSupported={isSpeechRecognitionSupported}
              onStartBrowserRecognition={handleStartBrowserRecognition}
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