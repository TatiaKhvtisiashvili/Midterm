/**
 * Module for managing the application state including flashcards, buckets, and practice history.
 * This is an in-memory implementation that resets when the server restarts.
 */

import { Flashcard, BucketMap, AnswerDifficulty } from "./logic/flashcards";
import { PracticeRecord } from "./types";

// Initial Data Configuration

/**
 * Sample flashcards to initialize the application state.
 * Each flashcard contains:
 * - front: The question or prompt
 * - back: The answer
 * - hint: A helpful clue
 * - tags: Categories for organization
 */
const initialCards: Flashcard[] = [
    new Flashcard(
        "Capital of Georgia?",
        "Tbilisi",
        "Starts with 'T'",
        ["geography", "capitals"]
    ),
    new Flashcard(
        "4**4 + 16?",
        "32",
        "sixteen times 2",
        ["math"]
    ),
    new Flashcard(
        "3**3?",
        "9",
        "three times three times three",
        ["math"]
    ),
    new Flashcard(
        "Capital of Italy?",
        "Rome",
        "The pope of ...",
        ["geography", "capitals"]
    ),
    new Flashcard(
        "Who wrote 'Romeo and Juliet'?",
        "William Shakespeare",
        "Many of his plays inspired operas.",
        ["literature"]
    ),
    new Flashcard(
        "Who wrote 'Frankenstein'?",
        "Mary Wollstonecraft Shelley",
        "Her name is Mary",
        ["literature"]
    ),
    new Flashcard(
        "Dottore", 
        "Doctor", 
        "who do you go to see at the hospital", 
        ["noun", "italian"]
    ),

    new Flashcard(
        "Cane", 
        "Dog", 
        "a loyal friend", 
        ["noun", "italian"]
    )
];

// State Variables

/**
 * Current bucket map storing flashcards in different learning stages.
 * - Key: Bucket number (0 = newest, higher numbers = more learned)
 * - Value: Set of flashcards in that bucket
 */
let currentBuckets: BucketMap = new Map();

/**
 * History of all practice sessions and card movements.
 * Each record tracks:
 * - The card practiced
 * - When it was practiced
 * - How difficult it was
 * - Bucket movement
 */
let practiceHistory: PracticeRecord[] = [];

/**
 * Current day in the spaced repetition schedule.
 * Used to determine which buckets should be practiced.
 */
let currentDay: number = 0;

// Initialize with sample cards in bucket 0 (newest)
currentBuckets.set(0, new Set(initialCards));
//I'm adding a 2nd bucket at least, since my functions assume minimum of 2 buckets already exist (bucket 0 and retirement bucket)
currentBuckets.set(1, new Set());

currentBuckets.set(2, new Set()); // current retirement bucket

// ======================
// State Accessors & Mutators
// ======================

/**
 * Gets the current bucket map.
 * @returns A new Map containing all buckets and their flashcards
 * @note Returns a copy to prevent direct modification of state
 */
export function getBuckets(): BucketMap {
    return new Map(currentBuckets);
}

/**
 * Updates the bucket map with new state.
 * @param newBuckets - Complete new bucket map to replace current state
 */
export function setBuckets(newBuckets: BucketMap): void {
    currentBuckets = new Map(newBuckets);
}

/**
 * Gets the complete practice history.
 * @returns Array of all practice records
 * @note Returns a copy to prevent direct modification of history
 */
export function getHistory(): PracticeRecord[] {
    return [...practiceHistory];
}

/**
 * Adds a new record to the practice history.
 * @param record - The practice record to add
 * @throws Will throw if record is malformed
 */
export function addHistoryRecord(record: PracticeRecord): void {
    if (!record.cardFront || !record.cardBack) {
        throw new Error("Invalid practice record: missing card information");
    }
    practiceHistory.push(record);
}

/**
 * Gets the current day in the spaced repetition schedule.
 * @returns The current day number (0-indexed)
 */
export function getCurrentDay(): number {
    return currentDay;
}

/**
 * Advances to the next day in the spaced repetition schedule.
 * Also triggers bucket scheduling for the new day.
 */
export function incrementDay(): void {
    currentDay++;
    console.log(`Advanced to day ${currentDay}`);
}

// Helper Functions

/**
 * Finds a flashcard by its front and back content.
 * @param front - The front text of the card
 * @param back - The back text of the card
 * @returns The matching Flashcard or undefined if not found
 */
export function findCard(front: string, back: string): Flashcard | undefined {
    if (!front || !back) return undefined;
    
    for (const [bucketNum, cards] of currentBuckets) {
        for (const card of cards) {
            if (card.front === front && card.back === back) {
                return card;
            }
        }
    }
    return undefined;
}

/**
 * Finds which bucket contains a specific flashcard.
 * @param cardToFind - The flashcard to locate
 * @returns The bucket number or undefined if card not found
 */
export function findCardBucket(cardToFind: Flashcard): number | undefined {
    if (!cardToFind?.front || !cardToFind?.back) return undefined;
    
    for (const [bucketNum, cards] of currentBuckets) {
        for (const card of cards) {
            if (card.front === cardToFind.front && card.back === cardToFind.back) {
                return bucketNum;
            }
        }
    }
    return undefined;
}

export function resetState(): void {
    currentBuckets = new Map<number, Set<Flashcard>>();
    practiceHistory = [];
    currentDay = 0;
    
    // Initialize with required buckets
    currentBuckets.set(0, new Set()); // New cards
    currentBuckets.set(1, new Set()); // Learning bucket
    currentBuckets.set(2, new Set()); // Retirement bucket
    
    console.log("State reset complete");
}

// Initialization Logging

console.log("Flashcard State Module Initialized:");
console.log(`- ${initialCards.length} sample cards loaded in bucket 0`);
console.log(`- Current day: ${currentDay}`);
console.log(`- Practice history: ${practiceHistory.length} records`);