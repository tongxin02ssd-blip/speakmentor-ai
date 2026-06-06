import { http } from './http';
import type {
  DialogueApiRequest,
  DialogueApiResponse,
} from '../types/practice';

export const requestDialogue = async (
  payload: DialogueApiRequest,
): Promise<DialogueApiResponse> => {
  const { data } = await http.post<DialogueApiResponse>(
    '/api/dialogue',
    payload,
  );

  return data;
};