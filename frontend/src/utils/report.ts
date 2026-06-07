import type {
  DialogueMessage,
  DialogueTurnFeedback,
  PracticeReport,
} from '../types/practice';

interface ExportPracticeReportParams {
  report: PracticeReport;
  messages: DialogueMessage[];
  latestFeedback: DialogueTurnFeedback | null;
}

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const sanitizeFileName = (value: string) => {
  return value
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 40);
};

const formatList = (items: string[]) => {
  return items.map((item) => `- ${item}`).join('\n');
};

const formatDialogueMessages = (messages: DialogueMessage[]) => {
  if (messages.length === 0) {
    return '暂无对话记录';
  }

  return messages
    .map((message, index) => {
      const role = message.role === 'user' ? 'You' : 'SpeakMentor AI';

      return `### ${index + 1}. ${role}

${message.content}

时间：${formatDateTime(message.createdAt)}
`;
    })
    .join('\n');
};

const formatFeedback = (feedback: DialogueTurnFeedback | null) => {
  if (!feedback) {
    return '暂无纠错反馈';
  }

  return `## 表达纠错

### 用户原句

${feedback.correction.originalText}

### 语法纠错

${feedback.correction.correctedText}

### 更自然表达

${feedback.correction.naturalExpression}

### 中文解释

${feedback.correction.explanation}

### 关键学习点

${formatList(feedback.correction.keyPoints)}

## 发音与流畅度

- 流畅度：${feedback.pronunciation.fluencyComment}
- 发音清晰度：${feedback.pronunciation.pronunciationComment}
- 语速表现：${feedback.pronunciation.paceComment}
- 提升建议：${feedback.pronunciation.improvementTip}

## 量化评分

| 维度 | 分数 |
| --- | --- |
| 流畅度 | ${feedback.score.fluency} |
| 准确度 | ${feedback.score.accuracy} |
| 表达自然度 | ${feedback.score.naturalness} |
| 场景完成度 | ${feedback.score.scenarioCompletion} |
| 综合评分 | ${feedback.score.overall} |
`;
};

export const createPracticeReportMarkdown = ({
  report,
  messages,
  latestFeedback,
}: ExportPracticeReportParams) => {
  return `# SpeakMentor AI 练习报告

## 练习概览

| 项目 | 内容 |
| --- | --- |
| 练习场景 | ${report.scenarioName} |
| 对话轮数 | ${report.totalTurns} |
| 练习时长 | ${report.durationText} |
| 综合评分 | ${report.overallScore} / 100 |
| 生成时间 | ${formatDateTime(report.generatedAt)} |

## 对话记录

${formatDialogueMessages(messages)}

${formatFeedback(latestFeedback)}

## 课后总结

### 表达亮点

${formatList(report.strengths)}

### 需要改进

${formatList(report.improvements)}

### 常见问题

${formatList(report.commonErrors)}

### 下一步练习建议

${formatList(report.nextPracticeTips)}

---

本报告由 SpeakMentor AI 自动生成，用于英语口语练习复盘。
`;
};

export const downloadMarkdownFile = (fileName: string, content: string) => {
  const blob = new Blob([content], {
    type: 'text/markdown;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

export const exportPracticeReportAsMarkdown = (
  params: ExportPracticeReportParams,
) => {
  const content = createPracticeReportMarkdown(params);
  const scenarioName = sanitizeFileName(params.report.scenarioName);
  const fileName = `SpeakMentor-${scenarioName}-练习报告.md`;

  downloadMarkdownFile(fileName, content);
};