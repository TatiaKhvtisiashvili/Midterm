import { Flashcard, BucketMap, AnswerDifficulty } from '@logic/flashcards';
import { PracticeRecord } from './types/index';


// Initial cards for the application
const initialCards: Flashcard[] = [
  new Flashcard(
    "What is the capital of France?", 
    "Paris", 
    "This city is known for the Eiffel Tower",
    ["geography", "European capitals"]
  ),
  new Flashcard(
    "What is 2 + 2?", 
    "4", 
    "This is a basic arithmetic operation",
    ["math", "basic arithmetic"]
  ),
  new Flashcard(
    "Who wrote 'Romeo and Juliet'?", 
    "William Shakespeare", 
    "He was an English playwright from the Elizabethan era",
    ["literature", "playwright"]
  ),
  new Flashcard(
    "What is the largest planet in our solar system?", 
    "Jupiter", 
    "This gas giant has a great red spot",
    ["astronomy", "planets"]
  )
];

// State variables
let currentBuckets: BucketMap = new Map();
let practiceHistory: PracticeRecord[] = [];
let currentDay: number = 0;

// Initialize the first bucket with initial cards
currentBuckets.set(0, new Set(initialCards));

// State Accessors
export function getBuckets(): BucketMap {
  return currentBuckets;
}

export function setBuckets(newBuckets: BucketMap): void {
  currentBuckets = newBuckets;
}

export function getHistory(): PracticeRecord[] {
  return practiceHistory;
}

export function addHistoryRecord(record: PracticeRecord): void {
  practiceHistory.push(record);
}

export function getCurrentDay(): number {
  return currentDay;
}

export function incrementDay(): void {
  currentDay++;
}

// Helper Functions
export function findCard(front: string, back: string): Flashcard | undefined {
  for (const bucket of currentBuckets.values()) {
    const foundCard = Array.from(bucket).find(
      card => card.front === front && card.back === back
    );
    if (foundCard) return foundCard;
  }
  return undefined;
}

export function findCardBucket(cardToFind: Flashcard): number | undefined {
  for (const [bucketNumber, bucket] of currentBuckets.entries()) {
    if (bucket.has(cardToFind)) return bucketNumber;
  }
  return undefined;
}

// Confirm initial state loading
console.log('Initial State Loaded:', {
  totalCards: initialCards.length,
  initialBucketZeroSize: currentBuckets.get(0)?.size || 0,
  currentDay
});