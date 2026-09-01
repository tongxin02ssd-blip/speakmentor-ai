import type { ScoreResult } from '../types/practice';

export type ScoreLevel = 'Excellent' | 'Good' | 'Fair' | 'Needs Practice';

export interface ScoreDimension {
  key: keyof Omit<ScoreResult, 'overall'>;
  label: string;
  value: number;
  description: string;
}

export const getScoreLevel = (score: number): ScoreLevel => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  return 'Needs Practice';
};

export const getScoreLevelText = (level: ScoreLevel) => {
  const levelTextMap: Record<ScoreLevel, string> = {
    Excellent: '表现优秀',
    Good: '表现良好',
    Fair: '基本达标',
    'Needs Practice': '需要练习',
  };

  return levelTextMap[level];
};

export const getScoreLevelDescription = (score: number) => {
  if (score >= 90) {
    return '表达流畅自然，能够较好适应当前英语交流场景。';
  }

  if (score >= 80) {
    return '表达清晰，具备较好的场景交流能力，继续优化自然度即可。';
  }

  if (score >= 70) {
    return '能够完成基本表达，但语法准确度和表达自然度仍有提升空间。';
  }

  return '当前表达仍需要更多练习，建议先强化基础句型和常用场景表达。';
};

export const getScoreTagColor = (score: number) => {
  if (score >= 90) return 'green';
  if (score >= 80) return 'blue';
  if (score >= 70) return 'orange';
  return 'red';
};

export const createScoreDimensions = (
  score: ScoreResult,
): ScoreDimension[] => {
  return [
    {
      key: 'fluency',
      label: '流畅度',
      value: score.fluency,
      description: '衡量表达是否连贯、停顿是否自然、语速是否稳定。',
    },
    {
      key: 'accuracy',
      label: '准确度',
      value: score.accuracy,
      description: '衡量语法、词汇和句子结构是否准确。',
    },
    {
      key: 'naturalness',
      label: '表达自然度',
      value: score.naturalness,
      description: '衡量表达是否符合真实英语交流习惯。',
    },
    {
      key: 'scenarioCompletion',
      label: '场景完成度',
      value: score.scenarioCompletion,
      description: '衡量回答是否贴合当前场景任务和交流目标。',
    },
  ];
};