export type ScenarioKey = 'interview' | 'restaurant' | 'meeting' | 'custom';

export interface PracticeScenario {
  key: ScenarioKey;
  title: string;
  englishTitle: string;
  description: string;
  promptHint: string;
}