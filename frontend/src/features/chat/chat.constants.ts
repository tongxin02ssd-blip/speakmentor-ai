import type { PracticeScenario } from './chat.types';

export const practiceScenarios: PracticeScenario[] = [
  {
    key: 'interview',
    label: '求职面试',
    englishLabel: 'Job interview',
    description: 'Practice introductions, experience, and behavioral questions.',
  },
  {
    key: 'restaurant',
    label: '餐厅点餐',
    englishLabel: 'Restaurant',
    description: 'Order food, ask for recommendations, and handle requests.',
  },
  {
    key: 'meeting',
    label: '商务会议',
    englishLabel: 'Business meeting',
    description: 'Share opinions, clarify details, and respond to colleagues.',
  },
  {
    key: 'custom',
    label: '自定义主题',
    englishLabel: 'Custom topic',
    description: 'Describe any real-world conversation you want to rehearse.',
  },
];
