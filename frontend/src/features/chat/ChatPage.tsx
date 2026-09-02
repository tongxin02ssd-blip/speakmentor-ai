import { useEffect, useMemo, useRef, useState } from 'react';
import ChatComposer from './components/ChatComposer';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import SessionSummaryModal from './components/SessionSummaryModal';
import { practiceScenarios } from './chat.constants';
import type { ChatMessage, ScenarioKey } from './chat.types';
import { useChatSession } from './hooks/useChatSession';
import { useSessionSummary } from './hooks/useSessionSummary';
import { decodeAudioBlob } from '../speech/audioProcessing';
import { useAudioRecorder } from '../speech/useAudioRecorder';
import { useTextToSpeech } from '../speech/useTextToSpeech';
import { useTranscription } from '../speech/useTranscription';

type VoiceStatus = 'idle' | 'recording' | 'processing' | 'ready' | 'error';

function ChatPage() {
  const [selectedScenarioKey, setSelectedScenarioKey] =
    useState<ScenarioKey>('interview');
  const [customTopic, setCustomTopic] = useState('');
  const [draft, setDraft] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [voiceMessage, setVoiceMessage] = useState('');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const voiceOperationIdRef = useRef(0);
  const {
    messages,
    error: chatError,
    isResponding,
    resetConversation,
    sendMessage,
    startConversation,
    stopGenerating,
  } = useChatSession();
  const {
    status: summaryStatus,
    summary,
    error: summaryError,
    generateSummary,
    resetSummary,
  } = useSessionSummary();
  const {
    isSupported,
    status: recorderStatus,
    elapsedSeconds,
    error: recorderError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();
  const {
    status: transcriptionStatus,
    progress: transcriptionProgress,
    device: transcriptionDevice,
    error: transcriptionError,
    loadModel,
    transcribe,
    resetTranscription,
  } = useTranscription();
  const {
    isSupported: canSpeak,
    speakingMessageId,
    ttsError,
    speak,
    stopSpeaking,
  } = useTextToSpeech();

  const selectedScenario = useMemo(
    () =>
      practiceScenarios.find(
        (scenario) => scenario.key === selectedScenarioKey,
      ) ?? practiceScenarios[0],
    [selectedScenarioKey],
  );
  const activeTopicName =
    selectedScenarioKey === 'custom' && customTopic.trim()
      ? customTopic.trim()
      : selectedScenario.englishLabel;

  const clearConversation = () => {
    voiceOperationIdRef.current += 1;
    resetConversation();
    cancelRecording();
    resetTranscription();
    resetSummary();
    stopSpeaking();
    setDraft('');
    setVoiceStatus('idle');
    setVoiceMessage('');
    setIsSummaryOpen(false);
  };

  const handleSelectScenario = (key: ScenarioKey) => {
    setSelectedScenarioKey(key);
    clearConversation();
  };

  const handleCustomTopicChange = (value: string) => {
    setCustomTopic(value);
    if (messages.length > 0) {
      clearConversation();
    }
  };

  const handleSend = () => {
    const text = draft.trim();

    if (!text || isResponding) {
      return;
    }

    setDraft('');
    setVoiceStatus('idle');
    setVoiceMessage('');
    stopSpeaking();
    void sendMessage({
      text,
      scenarioKey: selectedScenarioKey,
      scenarioName: activeTopicName,
    });
  };

  const handleVoiceInput = async () => {
    if (!isSupported) {
      setVoiceStatus('error');
      setVoiceMessage('当前浏览器不支持录音。');
      return;
    }

    voiceOperationIdRef.current += 1;
    const operationId = voiceOperationIdRef.current;
    stopSpeaking();

    try {
      if (recorderStatus === 'recording') {
        setVoiceStatus('processing');
        setVoiceMessage('正在准备本地转写…');
        const blob = await stopRecording();
        if (voiceOperationIdRef.current !== operationId) {
          return;
        }
        const samples = await decodeAudioBlob(blob);
        if (voiceOperationIdRef.current !== operationId) {
          return;
        }
        const transcript = await transcribe(samples);
        if (voiceOperationIdRef.current !== operationId) {
          return;
        }
        setDraft((current) =>
          current.trim() ? `${current.trim()} ${transcript}` : transcript,
        );
        setVoiceStatus('ready');
        setVoiceMessage('转写完成，你可以编辑后再发送。');
        return;
      }

      void loadModel().catch(() => undefined);
      await startRecording();
      if (voiceOperationIdRef.current !== operationId) {
        return;
      }
      setVoiceStatus('recording');
      setVoiceMessage('正在录音，再次点击麦克风即可停止。');
    } catch (error) {
      if (
        voiceOperationIdRef.current !== operationId ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) {
        return;
      }
      const detail = error instanceof Error ? error.message : '录音失败';
      setVoiceStatus('error');
      setVoiceMessage(detail);
    }
  };

  const handleSpeak = (message: ChatMessage) => {
    speak(message.content, message.id);
  };

  const handleEndSession = () => {
    if (isResponding) {
      return;
    }

    stopSpeaking();
    voiceOperationIdRef.current += 1;
    cancelRecording();
    resetTranscription();
    setVoiceStatus('idle');
    setVoiceMessage('');
    setIsSummaryOpen(true);
    void generateSummary(activeTopicName, messages);
  };

  const handleCloseSummary = () => {
    resetSummary();
    setIsSummaryOpen(false);
  };

  useEffect(() => {
    return () => cancelRecording();
  }, [cancelRecording]);

  const modelProgressText =
    transcriptionProgress === null
      ? '加载本地语音模型'
      : `加载本地语音模型 ${Math.round(transcriptionProgress)}%`;
  const deviceText = transcriptionDevice
    ? ` · ${transcriptionDevice.toUpperCase()}`
    : '';
  const statusMessage =
    recorderStatus === 'recording'
      ? `正在录音 ${Math.floor(elapsedSeconds / 60)}:${String(
          elapsedSeconds % 60,
        ).padStart(2, '0')} · ${
          transcriptionStatus === 'loading'
            ? modelProgressText
            : '再次点击麦克风停止'
        }${deviceText}`
      : voiceStatus === 'processing'
        ? transcriptionStatus === 'loading'
          ? `${modelProgressText}${deviceText}`
          : '正在本地转写英文…'
        : voiceStatus !== 'idle'
          ? voiceMessage
          : recorderError ||
            transcriptionError ||
            chatError ||
            ttsError ||
            (isResponding ? 'AI 正在组织回复…' : '');
  const canEndSession = messages.some(
    (message) => message.role === 'user' && message.status === 'done',
  );

  return (
    <div className="app-shell">
      <ChatHeader
        selectedScenarioKey={selectedScenarioKey}
        customTopic={customTopic}
        hasMessages={messages.length > 0}
        onSelectScenario={handleSelectScenario}
        onChangeCustomTopic={handleCustomTopicChange}
        onNewConversation={clearConversation}
        canEndSession={canEndSession && !isResponding}
        isSummarizing={summaryStatus === 'loading'}
        onEndSession={handleEndSession}
      />

      <main className="chat-workspace">
        <MessageList
          messages={messages}
          topicName={activeTopicName}
          topicDescription={selectedScenario.description}
          speakingMessageId={speakingMessageId}
          canSpeak={canSpeak}
          onSpeak={handleSpeak}
          onStopSpeaking={stopSpeaking}
          isResponding={isResponding}
          onStartConversation={() =>
            void startConversation({
              scenarioKey: selectedScenarioKey,
              scenarioName: activeTopicName,
            })
          }
        />
        <ChatComposer
          value={draft}
          isResponding={isResponding}
          isRecording={recorderStatus === 'recording'}
          isVoiceBusy={
            recorderStatus === 'requesting' || recorderStatus === 'stopping'
              || transcriptionStatus === 'transcribing'
          }
          isVoiceSupported={isSupported}
          statusMessage={statusMessage}
          onChange={setDraft}
          onSend={handleSend}
          onVoiceInput={handleVoiceInput}
          onStopGenerating={stopGenerating}
        />
      </main>

      {isSummaryOpen && (
        <SessionSummaryModal
          status={summaryStatus}
          summary={summary}
          error={summaryError}
          onClose={handleCloseSummary}
          onRetry={handleEndSession}
          onNewSession={clearConversation}
        />
      )}
    </div>
  );
}

export default ChatPage;
