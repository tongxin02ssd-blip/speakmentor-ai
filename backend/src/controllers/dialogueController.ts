import type { Request, Response } from 'express';
import type { DialogueRequest, ScenarioKey } from '../types/practice';
import { createDialogueResponse } from '../services/dialogueService';

const validScenarioKeys: ScenarioKey[] = [
  'interview',
  'restaurant',
  'meeting',
  'custom',
];

const isValidScenarioKey = (value: unknown): value is ScenarioKey => {
  return (
    typeof value === 'string' &&
    validScenarioKeys.includes(value as ScenarioKey)
  );
};

export const createDialogue = async (req: Request, res: Response) => {
  const { scenarioKey, scenarioName, userText } =
    req.body as Partial<DialogueRequest>;

  if (!isValidScenarioKey(scenarioKey)) {
    return res.status(400).json({
      message: 'Invalid scenarioKey',
    });
  }

  if (!scenarioName || typeof scenarioName !== 'string') {
    return res.status(400).json({
      message: 'scenarioName is required',
    });
  }

  if (!userText || typeof userText !== 'string') {
    return res.status(400).json({
      message: 'userText is required',
    });
  }

  const result = await createDialogueResponse({
    scenarioKey,
    scenarioName,
    userText,
  });

  return res.status(200).json(result);
};