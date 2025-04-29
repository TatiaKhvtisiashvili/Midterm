
export type Flashcard = { 
    front: string; 
    back: string; 
    hint: string; 
    tags: ReadonlyArray<string>; 
}

export enum AnswerDifficulty {
    Wrong = 0,
    Hard = 1,
    Easy = 2,
}

// Response shape from /api/practice
export interface PracticeSession {
    cards: Flashcard[];
    day: number;
  }

  export interface UpdateRequest {
    cardFront: string;
    cardBack: string;
    difficulty: AnswerDifficulty;
  }


export type ProgressStats = {
    totalCards: number;
    cardsByBucket: Record<number, number>;
    retiredCards: number;
    successRate: number;
    hardestCards: Flashcard[];
    averageMovesPerCard: number;
    totalPracticeEvents: number;
}
