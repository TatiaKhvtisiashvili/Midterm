// frontend/src/services/api.ts
import axios from 'axios';
import {
  AnswerDifficulty,
  Flashcard,
  PracticeSession,
  ProgressStats,
  UpdateRequest
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchPracticeCards = async (): Promise<PracticeSession> => {
  const response = await apiClient.get<PracticeSession>('/practice');
  return response.data;
};

export const submitAnswer = async (
  flashcard: Flashcard,
  difficulty: AnswerDifficulty,
  currentBucket: number
): Promise<void> => {
  const payload: UpdateRequest = {
    flashcard,
    difficulty,
    currentBucket
  };
  await apiClient.post('/update', payload);
};

export const fetchHint = async (flashcard: Flashcard): Promise<string> => {
  const response = await apiClient.get<{ hint: string }>('/hint', {
    params: {
      cardFront: flashcard.front,
      cardBack: flashcard.back,
    },
  });
  return response.data.hint;
};

export const fetchProgress = async (): Promise<ProgressStats> => {
  const response = await apiClient.get<ProgressStats>('/progress');
  return response.data;
};

export const advanceDay = async (): Promise<{ currentDay: number }> => {
  const response = await apiClient.post<{ currentDay: number }>('/day/next');
  return response.data;
};