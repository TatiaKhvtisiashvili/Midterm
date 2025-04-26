// frontend/src/types/index.ts

// AnswerDifficulty enum (matches backend)
export enum AnswerDifficulty {
    Wrong = 0,
    Hard = 1,
    Easy = 2,
  }
  
  // Flashcard type (matches logic/flashcards.ts)
  export interface Flashcard {
    front: string;
    back: string;
    hint?: string;
    tags: readonly string[];
  }
  
  // BucketMap type (matches logic/flashcards.ts)
  export type BucketMap = Map<number, Set<Flashcard>>;
  
  // PracticeSession type (simplified to match likely backend response)
  export interface PracticeSession {
    id: string;
    bucketMap: BucketMap;
    currentBucket: number;
    currentFlashcard?: Flashcard;
    isComplete: boolean;
  }
  
  // UpdateRequest type (matches likely backend request)
  export interface UpdateRequest {
    flashcard: Flashcard;
    difficulty: AnswerDifficulty;
    currentBucket: number;
  }
  
  // ProgressStats type (basic structure - adjust as needed)
  export interface ProgressStats {
    totalFlashcards: number;
    flashcardsByBucket: {
      bucket: number;
      count: number;
    }[];
    nextDueCount: number;
  }