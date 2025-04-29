"use strict";
/**
 * Module for managing the application state including flashcards, buckets, and practice history.
 * This is an in-memory implementation that resets when the server restarts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuckets = getBuckets;
exports.setBuckets = setBuckets;
exports.getHistory = getHistory;
exports.addHistoryRecord = addHistoryRecord;
exports.getCurrentDay = getCurrentDay;
exports.incrementDay = incrementDay;
exports.findCard = findCard;
exports.findCardBucket = findCardBucket;
const flashcards_1 = require("./logic/flashcards");
// Initial Data Configuration
/**
 * Sample flashcards to initialize the application state.
 * Each flashcard contains:
 * - front: The question or prompt
 * - back: The answer
 * - hint: A helpful clue
 * - tags: Categories for organization
 */
const initialCards = [
    new flashcards_1.Flashcard("Capital of Georgia?", "Tbilisi", "Starts with 'T'", ["geography", "capitals"]),
    new flashcards_1.Flashcard("4**4 + 16?", "32", "sixteen times 2", ["math"]),
    new flashcards_1.Flashcard("3**3?", "9", "three times three times three", ["math"]),
    new flashcards_1.Flashcard("Capital of Italy?", "Rome", "The pope of ...", ["geography", "capitals"]),
    new flashcards_1.Flashcard("Who wrote 'Romeo and Juliet'?", "William Shakespeare", "Many of his plays inspired operas.", ["literature"]),
    new flashcards_1.Flashcard("Who wrote 'Frankenstein'?", "Mary Wollstonecraft Shelley", "Her name is Mary", ["literature"]),
    new flashcards_1.Flashcard("Dottore", "Doctor", "who do you go to see at the hospital", ["noun", "italian"]),
    new flashcards_1.Flashcard("Cane", "Dog", "a loyal friend", ["noun", "italian"])
];
// State Variables
/**
 * Current bucket map storing flashcards in different learning stages.
 * - Key: Bucket number (0 = newest, higher numbers = more learned)
 * - Value: Set of flashcards in that bucket
 */
let currentBuckets = new Map();
/**
 * History of all practice sessions and card movements.
 * Each record tracks:
 * - The card practiced
 * - When it was practiced
 * - How difficult it was
 * - Bucket movement
 */
let practiceHistory = [];
/**
 * Current day in the spaced repetition schedule.
 * Used to determine which buckets should be practiced.
 */
let currentDay = 0;
// Initialize with sample cards in bucket 0 (newest)
currentBuckets.set(0, new Set(initialCards));
//I'm adding retired bucket too, since my functions assume it already exists (which it should)
currentBuckets.set(1, new Set());
// ======================
// State Accessors & Mutators
// ======================
/**
 * Gets the current bucket map.
 * @returns A new Map containing all buckets and their flashcards
 * @note Returns a copy to prevent direct modification of state
 */
function getBuckets() {
    return new Map(currentBuckets);
}
/**
 * Updates the bucket map with new state.
 * @param newBuckets - Complete new bucket map to replace current state
 */
function setBuckets(newBuckets) {
    currentBuckets = new Map(newBuckets);
}
/**
 * Gets the complete practice history.
 * @returns Array of all practice records
 * @note Returns a copy to prevent direct modification of history
 */
function getHistory() {
    return [...practiceHistory];
}
/**
 * Adds a new record to the practice history.
 * @param record - The practice record to add
 * @throws Will throw if record is malformed
 */
function addHistoryRecord(record) {
    if (!record.cardFront || !record.cardBack) {
        throw new Error("Invalid practice record: missing card information");
    }
    practiceHistory.push(record);
}
/**
 * Gets the current day in the spaced repetition schedule.
 * @returns The current day number (0-indexed)
 */
function getCurrentDay() {
    return currentDay;
}
/**
 * Advances to the next day in the spaced repetition schedule.
 * Also triggers bucket scheduling for the new day.
 */
function incrementDay() {
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
function findCard(front, back) {
    if (!front || !back)
        return undefined;
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
function findCardBucket(cardToFind) {
    if (!(cardToFind === null || cardToFind === void 0 ? void 0 : cardToFind.front) || !(cardToFind === null || cardToFind === void 0 ? void 0 : cardToFind.back))
        return undefined;
    for (const [bucketNum, cards] of currentBuckets) {
        for (const card of cards) {
            if (card.front === cardToFind.front && card.back === cardToFind.back) {
                return bucketNum;
            }
        }
    }
    return undefined;
}
// Initialization Logging
console.log("Flashcard State Module Initialized:");
console.log(`- ${initialCards.length} sample cards loaded in bucket 0`);
console.log(`- Current day: ${currentDay}`);
console.log(`- Practice history: ${practiceHistory.length} records`);
