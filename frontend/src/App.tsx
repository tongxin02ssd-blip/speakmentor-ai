import { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, Typography } from 'antd';
import { requestDialogue } from './api/dialogue';
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
  createMockPracticeReport,
  createMockTurnFeedback,
} from './mocks';
import type {
  AiReplyStatus,
  DialogueMessage,
  DialogueMode,
  DialogueTurnFeedback,
  FeedbackStatus,
  LatencyMetrics,
  PracticeReport,
  RecognitionSource,
  RecognitionStatus,
  ReportStatus,
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

  const [reportStatus, setReportStatus] =
    useState<ReportStatus>('idle');
  const [practiceReport, setPracticeReport] =
    useState<PracticeReport | null>(null);
  const [reportError, setReportError] = useState('');

  const [dialogueMode, setDialogueMode] = useState<DialogueMode>(null);
  const [apiNotice, setApiNotice] = useState('');

  const recognitionTimerRef = useRef<number | null>(null);
  const reportTimerRef = useRef<number | null>(null);
  const dialogueRequestIdRef = useRef(0);

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

  const canGenerateReport =
    messages.some((message) => message.role === 'user') &&
    feedbackStatus === 'success' &&
    Boolean(latestFeedback);

  const clearRecognitionTimer = () => {
    if (recognitionTimerRef.current) {
      window.clearTimeout(recognitionTimerRef.current);
      recognitionTimerRef.current = null;
    }
  };

  const clearReportTimer = () => {
    if (reportTimerRef.current) {
      window.clearTimeout(reportTimerRef.current);
      reportTimerRef.current = null;
    }
  };

  const invalidatePendingDialogueRequest = () => {
    dialogueRequestIdRef.current += 1;
  };

  const handleGenerateReport = () => {
    clearReportTimer();

    if (!canGenerateReport) {
      setReportStatus('error');
      setReportError('请先完成至少一轮对话，再生成课后总结。');
      return;
    }

    setReportStatus('generating');
    setPracticeReport(null);
    setReportError('');

    reportTimerRef.current = window.setTimeout(() => {
      try {
        const totalTurns = messages.filter(
          (message) => message.role === 'user',
        ).length;

        const report = createMockPracticeReport({
          scenarioName: activeScenarioName,
          totalTurns,
          overallScore: latestFeedback?.score.overall ?? 80,
        });

        setPracticeReport(report);
        setReportStatus('success');
      } catch {
        setReportStatus('error');
        setReportError('课后总结生成失败，请重新尝试。');
      } finally {
        reportTimerRef.current = null;
      }
    }, 700);
  };

  const applyFrontendMockDialogue = (
    userMessageId: string,
    userText: string,
    asrMs: number,
    notice: string,
  ) => {
    const mockAiResult = createMockAiReplyResult({
      scenarioKey: selectedScenarioKey,
      scenarioName: activeScenarioName,
      userText,
      asrMs,
    });

    const feedback = createMockTurnFeedback({
      messageId: userMessageId,
      userText,
      scenarioKey: selectedScenarioKey,
    });

    setMessages((prevMessages) => [
      ...prevMessages,
      mockAiResult.aiMessage,
    ]);
    setLatestFeedback(feedback);
    setAiReplyStatus('success');
    setFeedbackStatus('success');
    setDialogueMode('frontend-mock');
    setApiNotice(notice);
  };

  const startDialogueFlow = async (
    userMessageId: string,
    userText: string,
    asrMs: number,
  ) => {
    invalidatePendingDialogueRequest();

    const currentRequestId = dialogueRequestIdRef.current;
    const startedAt = performance.now();

    setAiReplyStatus('thinking');
    setAiReplyError('');
    setFeedbackStatus('generating');
    setLatestFeedback(null);
    setFeedbackError('');
    setReportStatus('idle');
    setPracticeReport(null);
    setReportError('');
    setDialogueMode(null);
    setApiNotice('');

    try {
      const response = await requestDialogue({
        scenarioKey: selectedScenarioKey,
        scenarioName: activeScenarioName,
        userText,
      });

      if (dialogueRequestIdRef.current !== currentRequestId) {
        return;
      }

      const fallbackAiMs = Math.round(performance.now() - startedAt);
      const aiMs = response.aiMessage.latency?.aiMs ?? fallbackAiMs;

      const normalizedAiMessage: DialogueMessage = {
        ...response.aiMessage,
        latency: {
          asrMs,
          aiMs,
          totalMs: asrMs + aiMs,
        },
      };

      const normalizedFeedback: DialogueTurnFeedback = {
        ...response.feedback,
        messageId: userMessageId,
      };

      setMessages((prevMessages) => [
        ...prevMessages,
        normalizedAiMessage,
      ]);
      setLatestFeedback(normalizedFeedback);
      setAiReplyStatus('success');
      setFeedbackStatus('success');
      setDialogueMode(response.mode === 'ai' ? 'backend-ai' : 'backend-mock');
    } catch (error) {
      if (dialogueRequestIdRef.current !== currentRequestId) {
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : '后端接口请求失败';

      applyFrontendMockDialogue(
        userMessageId,
        userText,
        asrMs,
        `后端请求失败：${errorMessage}。已自动降级为前端 Mock，保证演示流程继续。`,
      );
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

    void startDialogueFlow(userMessage.id, text, latency.asrMs);
  };

  const resetPracticeState = () => {
    clearRecognitionTimer();
    clearReportTimer();
    invalidatePendingDialogueRequest();
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

    setReportStatus('idle');
    setPracticeReport(null);
    setReportError('');

    setDialogueMode(null);
    setApiNotice('');
  };

  const handleSelectScenario = (scenarioKey: ScenarioKey) => {
    setSelectedScenarioKey(scenarioKey);
    resetPracticeState();
  };

  const prepareRecognition = () => {
    clearRecognitionTimer();
    clearReportTimer();
    invalidatePendingDialogueRequest();
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

    setReportStatus('idle');
    setPracticeReport(null);
    setReportError('');

    setDialogueMode(null);
    setApiNotice('');
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

        void startDialogueFlow(
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
      clearReportTimer();
      invalidatePendingDialogueRequest();
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
              dialogueMode={dialogueMode}
              apiNotice={apiNotice}
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
              reportStatus={reportStatus}
              practiceReport={practiceReport}
              reportError={reportError}
              canGenerateReport={canGenerateReport}
              onGenerateReport={handleGenerateReport}
            />
          </aside>
        </section>
      </Content>
    </Layout>
  );
}

export default App;