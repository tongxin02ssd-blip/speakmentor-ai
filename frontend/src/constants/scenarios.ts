import type { PracticeScenario } from '../types/practice';

export const practiceScenarios: PracticeScenario[] = [
  {
    key: 'interview',
    title: '面试场景',
    englishTitle: 'Job Interview',
    description: '模拟英文自我介绍、项目经历、实习经历和行为面试问答。',
    promptHint:
      'The AI should act as an interviewer and ask questions about self-introduction, project experience and career goals.',
  },
  {
    key: 'restaurant',
    title: '点餐场景',
    englishTitle: 'Restaurant Ordering',
    description: '练习餐厅点餐、询问推荐、表达口味偏好和确认订单。',
    promptHint:
      'The AI should act as a waiter or waitress and guide the user through ordering food in English.',
  },
  {
    key: 'meeting',
    title: '会议场景',
    englishTitle: 'Business Meeting',
    description: '练习会议发言、表达观点、补充建议和回应同事问题。',
    promptHint:
      'The AI should act as a colleague in a business meeting and encourage the user to express opinions clearly.',
  },
  {
    key: 'custom',
    title: '自定义场景',
    englishTitle: 'Custom Scenario',
    description: '输入你想练习的真实交流主题，例如项目答辩、机场问路、客户沟通。',
    promptHint:
      'The AI should generate a conversation based on the custom scenario provided by the user.',
  },
];