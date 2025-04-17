import {Flashcard, AnswerDifficulty, BucketMap } from "../logic/flashcards";

/**
 * Represents a practice session with a set of flashcards for a specific day
 */
export interface PracticeSession {
  cards: Flashcard[];
  day: number;
}

/**
 * Represents a request to update a flashcard's information 
 */
export interface UpdateRequest {
  cardFront: string;
  cardBack: string;
  difficulty: AnswerDifficulty;
}

/**
 * Represents a request for a hint for a specific flashcard
 */
export interface HintRequest {
  cardFront: string;
  cardBack: string;
}

/**
 * Represents comprehensive progress statistics for flashcard learning
 * Aligned with the computeProgress function's output
 */
export interface ProgressStats {
  totalCards: number;
  cardsByBucket: Record<number, number>;
  successRate: number;
  averageMovesPerCard: number;
  totalPracticeEvents: number;
}

/**
 * Represents a single practice record for tracking card progression
 */
export interface PracticeRecord {
  cardFront: string;
  cardBack: string;
  timestamp: number;
  difficulty: AnswerDifficulty;
  previousBucket: number;
  newBucket: number;
}

// Re-export core types from flashcards logic
export { 
  Flashcard, 
  AnswerDifficulty, 
  BucketMap 
};