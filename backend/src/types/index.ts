// backend/src/types/index.ts

// Import core types
import { Flashcard, AnswerDifficulty, BucketMap } from "@logic/flashcards";

// Define interfaces

export interface PracticeSession {
  cards: Flashcard[];
  day: number;
}

export interface UpdateRequest {
  cardFront: string;
  cardBack: string;
  difficulty: AnswerDifficulty;
}

export interface HintRequest {
  cardFront: string;
  cardBack: string;
}

export interface ProgressStats {
    totalCards: number;
    cardsByBucket: Record<number, number>;
    retiredCards: number;
    successRate: number;
    hardestCards: Flashcard[];
    averageMovesPerCard: number;
    totalPracticeEvents: number;
  }
  
  export interface PracticeRecord {
     cardFront: string,
     cardBack: string, 
     timestamp: number, 
     difficulty: AnswerDifficulty, 
     previousBucket: number, 
     newBucket: number 
  }

// Also export the core types in case you want them available when you import from this file
export type { Flashcard, AnswerDifficulty, BucketMap };
