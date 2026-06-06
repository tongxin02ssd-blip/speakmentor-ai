import { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, Typography } from 'antd';
import AppHeader from './components/AppHeader';
import DialoguePanel from './components/DialoguePanel';
import FeedbackPanel from './components/FeedbackPanel';
import ScenarioPanel from './components/ScenarioPanel';
import VoiceInputPanel from './components/VoiceInputPanel';
import { practiceScenarios } from './constants/scenarios';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import {
  createMockAiReplyResult,
  createMockAsrResult,
  createMockTurnFeedback,
} from './mocks';
import type {
  AiReplyStatus,
  DialogueMessage,
  DialogueTurnFeedback,
  FeedbackStatus,
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

  const [aiReplyStatus, setAiReplyStatus] =
    useState<AiReplyStatus>('idle');
  const [aiReplyError, setAiReplyError] = useState('');

  const [feedbackStatus, setFeedbackStatus] =
    useState<FeedbackStatus>('idle');
  const [latestFeedback, setLatestFeedback] =
    useState<DialogueTurnFeedback | null>(null);
  const [feedbackError, setFeedbackError] = useState('');

  const recognitionTimerRef = useRef<number | null>(null);
  const aiReplyTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  const {
    isSupported: isSpeechRecognitionSupported,
    startRecognition,
    stopRecognition,
  } = useSpeechRecognition();

  const {
    isSupported: isTextToSpeechSupported,
    ttsStatus,
    speakingMessageId,
    ttsError,
    speak,
    stopSpeaking,
  } = useTextToSpeech();

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

  const clearAiReplyTimer = () => {
    if (aiReplyTimerRef.current) {
      window.clearTimeout(aiReplyTimerRef.current);
      aiReplyTimerRef.current = null;
    }
  };

  const clearFeedbackTimer = () => {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  };

  const startMockFeedbackFlow = (messageId: string, userText: string) => {
    clearFeedbackTimer();

    setFeedbackStatus('generating');
    setLatestFeedback(null);
    setFeedbackError('');

    feedbackTimerRef.current = window.setTimeout(() => {
      try {
        const feedback = createMockTurnFeedback({
          messageId,
          userText,
          scenarioKey: selectedScenarioKey,
        });

        setLatestFeedback(feedback);
        setFeedbackStatus('success');
      } catch {
        setFeedbackStatus('error');
        setFeedbackError('Mock 纠错反馈生成失败，请重新尝试。');
      } finally {
        feedbackTimerRef.current = null;
      }
    }, 700);
  };

  const startMockAiReplyFlow = (
    userMessageId: string,
    userText: string,
    asrMs: number,
  ) => {
    clearAiReplyTimer();

    setAiReplyStatus('thinking');
    setAiReplyError('');

    aiReplyTimerRef.current = window.setTimeout(() => {
      try {
        const mockAiResult = createMockAiReplyResult({
          scenarioKey: selectedScenarioKey,
          scenarioName: activeScenarioName,
          userText,
          asrMs,
        });

        setMessages((prevMessages) => [
          ...prevMessages,
          mockAiResult.aiMessage,
        ]);
        setAiReplyStatus('success');

        startMockFeedbackFlow(userMessageId, userText);
      } catch {
        setAiReplyStatus('error');
        setAiReplyError('Mock AI 回复生成失败，请重新尝试。');
      } finally {
        aiReplyTimerRef.current = null;
      }
    }, 900);
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

    startMockAiReplyFlow(userMessage.id, text, latency.asrMs);
  };

  const resetPracticeState = () => {
    clearRecognitionTimer();
    clearAiReplyTimer();
    clearFeedbackTimer();
    stopRecognition();
    stopSpeaking();

    setMessages([]);
    setRecognitionStatus('idle');
    setRecognitionSource(null);
    setRecognizedText('');
    setRecognitionError('');
    setRecognitionNotice('');
    setLastAsrMs(null);

    setAiReplyStatus('idle');
    setAiReplyError('');

    setFeedbackStatus('idle');
    setLatestFeedback(null);
    setFeedbackError('');
  };

  const handleSelectScenario = (scenarioKey: ScenarioKey) => {
    setSelectedScenarioKey(scenarioKey);
    resetPracticeState();
  };

  const prepareRecognition = () => {
    clearRecognitionTimer();
    clearAiReplyTimer();
    clearFeedbackTimer();
    stopSpeaking();

    setRecognitionStatus('recognizing');
    setRecognitionSource(null);
    setRecognizedText('');
    setRecognitionError('');
    setRecognitionNotice('');
    setLastAsrMs(null);

    setAiReplyStatus('idle');
    setAiReplyError('');

    setFeedbackStatus('idle');
    setLatestFeedback(null);
    setFeedbackError('');
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

        startMockAiReplyFlow(
          mockResult.userMessage.id,
          mockResult.recognizedText,
          mockResult.latency.asrMs,
        );
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

  const handleSpeakMessage = (message: DialogueMessage) => {
    speak(message.content, message.id);
  };

  useEffect(() => {
    return () => {
      clearRecognitionTimer();
      clearAiReplyTimer();
      clearFeedbackTimer();
      stopRecognition();
      stopSpeaking();
    };
  }, [stopRecognition, stopSpeaking]);

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
              aiReplyStatus={aiReplyStatus}
              aiReplyError={aiReplyError}
              ttsStatus={ttsStatus}
              speakingMessageId={speakingMessageId}
              ttsError={ttsError}
              isTextToSpeechSupported={isTextToSpeechSupported}
              onSpeakMessage={handleSpeakMessage}
              onStopSpeaking={stopSpeaking}
            />
          </main>

          <aside className="right-column">
            <FeedbackPanel
              feedbackStatus={feedbackStatus}
              latestFeedback={latestFeedback}
              feedbackError={feedbackError}
            />
          </aside>
        </section>
      </Content>
    </Layout>
  );
}

export default App;