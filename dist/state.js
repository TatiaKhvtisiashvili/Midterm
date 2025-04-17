"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuckets = getBuckets;
exports.setBuckets = setBuckets;
exports.getHistory = getHistory;
exports.addHistoryRecord = addHistoryRecord;
exports.getCurrentDay = getCurrentDay;
exports.incrementDay = incrementDay;
exports.findCard = findCard;
exports.findCardBucket = findCardBucket;
const flashcards_1 = require("@logic/flashcards");
// Initial cards for the application
const initialCards = [
    new flashcards_1.Flashcard("What is the capital of France?", "Paris", "This city is known for the Eiffel Tower", ["geography", "European capitals"]),
    new flashcards_1.Flashcard("What is 2 + 2?", "4", "This is a basic arithmetic operation", ["math", "basic arithmetic"]),
    new flashcards_1.Flashcard("Who wrote 'Romeo and Juliet'?", "William Shakespeare", "He was an English playwright from the Elizabethan era", ["literature", "playwright"]),
    new flashcards_1.Flashcard("What is the largest planet in our solar system?", "Jupiter", "This gas giant has a great red spot", ["astronomy", "planets"])
];
// State variables
let currentBuckets = new Map();
let practiceHistory = [];
let currentDay = 0;
// Initialize the first bucket with initial cards
currentBuckets.set(0, new Set(initialCards));
// State Accessors
function getBuckets() {
    return currentBuckets;
}
function setBuckets(newBuckets) {
    currentBuckets = newBuckets;
}
function getHistory() {
    return practiceHistory;
}
function addHistoryRecord(record) {
    practiceHistory.push(record);
}
function getCurrentDay() {
    return currentDay;
}
function incrementDay() {
    currentDay++;
}
// Helper Functions
function findCard(front, back) {
    for (const bucket of currentBuckets.values()) {
        const foundCard = Array.from(bucket).find(card => card.front === front && card.back === back);
        if (foundCard)
            return foundCard;
    }
    return undefined;
}
function findCardBucket(cardToFind) {
    for (const [bucketNumber, bucket] of currentBuckets.entries()) {
        if (bucket.has(cardToFind))
            return bucketNumber;
    }
    return undefined;
}
// Confirm initial state loading
console.log('Initial State Loaded:', {
    totalCards: initialCards.length,
    initialBucketZeroSize: ((_a = currentBuckets.get(0)) === null || _a === void 0 ? void 0 : _a.size) || 0,
    currentDay
});
