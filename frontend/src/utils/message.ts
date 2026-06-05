import type {
  DialogueMessage,
  LatencyMetrics,
  MessageRole,
  ScenarioKey,
} from '../types/practice';

interface CreateDialogueMessageParams {
  role: MessageRole;
  content: string;
  scenarioKey: ScenarioKey;
  scenarioName: string;
  latency?: LatencyMetrics;
}

const createId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createDialogueMessage = ({
  role,
  content,
  scenarioKey,
  scenarioName,
  latency,
}: CreateDialogueMessageParams): DialogueMessage => {
  return {
    id: createId(`${role}-message`),
    role,
    content,
    scenarioKey,
    scenarioName,
    createdAt: new Date().toISOString(),
    latency,
  };
};