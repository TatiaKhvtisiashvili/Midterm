"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBucketSets = toBucketSets;
exports.practice = practice;
exports.update = update;
exports.getHint = getHint;
exports.computeProgress = computeProgress;
const flashcards_1 = require("./flashcards");
/**
 * Converts a BucketMap into an array of Sets, where the index is the bucket number
 */
function toBucketSets(buckets) {
    const result = [];
    // Find the highest bucket number
    let maxBucket = 0;
    for (const bucketNum of buckets.keys()) {
        maxBucket = Math.max(maxBucket, bucketNum);
    }
    // Initialize array with empty sets
    for (let i = 0; i <= maxBucket; i++) {
        result.push(new Set());
    }
    // Fill in the sets from the map
    for (const [bucketNum, cards] of buckets.entries()) {
        result[bucketNum] = cards;
    }
    return result;
}
/**
 * Determines which cards should be practiced on a given day,
 * based on the Leitner system.
 */
function practice(buckets, day) {
    const result = new Set();
    // Always practice cards from bucket 0
    if (buckets[0]) {
        for (const card of buckets[0]) {
            result.add(card);
        }
    }
    // For other buckets, practice on days divisible by 2^(bucket number)
    for (let bucketNum = 1; bucketNum < buckets.length; bucketNum++) {
        const interval = Math.pow(2, bucketNum);
        if (day % interval === 0 && buckets[bucketNum]) {
            for (const card of buckets[bucketNum]) {
                result.add(card);
            }
        }
    }
    return result;
}
/**
 * Updates the buckets based on the answer difficulty
 */
function update(buckets, card, difficulty) {
    // Create a deep copy of the buckets map
    const newBuckets = new Map();
    // Find which bucket currently contains the card
    let currentBucket = -1;
    for (const [bucketNum, cards] of buckets.entries()) {
        const newSet = new Set(cards);
        newBuckets.set(bucketNum, newSet);
        if (cards.has(card)) {
            currentBucket = bucketNum;
        }
    }
    // If card wasn't found in any bucket, add bucket 0
    if (currentBucket === -1 && !newBuckets.has(0)) {
        newBuckets.set(0, new Set());
    }
    // Remove card from current bucket
    if (currentBucket !== -1) {
        const currentSet = newBuckets.get(currentBucket);
        currentSet.delete(card);
    }
    // Calculate new bucket
    let newBucket;
    if (difficulty === flashcards_1.AnswerDifficulty.Wrong) {
        newBucket = 0; // Answered wrong, go back to bucket 0
    }
    else if (difficulty === flashcards_1.AnswerDifficulty.Hard) {
        newBucket = currentBucket; // Hard, stay in the same bucket
    }
    else {
        // Easy, move to the next bucket
        newBucket = currentBucket + 1;
    }
    // Ensure the new bucket exists
    if (!newBuckets.has(newBucket)) {
        newBuckets.set(newBucket, new Set());
    }
    // Add card to its new bucket
    newBuckets.get(newBucket).add(card);
    return newBuckets;
}
/**
 * Retrieves a hint for a flashcard
 */
function getHint(card) {
    if (card.hint) {
        return card.hint;
    }
    return "No hint available for this card.";
}
/**
 * Computes progress statistics based on current buckets and history
 */
function computeProgress(buckets, history) {
    // Count total cards across all buckets
    let totalCards = 0;
    const cardsByBucket = {};
    for (const [bucketNum, cards] of buckets.entries()) {
        totalCards += cards.size;
        cardsByBucket[bucketNum] = cards.size;
    }
    // Initialize buckets not present in the map
    for (let i = 0; i <= Math.max(...Object.keys(cardsByBucket).map(Number), 0); i++) {
        if (!(i in cardsByBucket)) {
            cardsByBucket[i] = 0;
        }
    }
    // Calculate success rate from history
    let totalAnswers = history.length;
    let correctAnswers = history.filter((record) => record.difficulty === flashcards_1.AnswerDifficulty.Easy ||
        record.difficulty === flashcards_1.AnswerDifficulty.Hard).length;
    const successRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    // Calculate average moves per card
    const cardMoves = {};
    for (const record of history) {
        const cardKey = `${record.cardFront}:${record.cardBack}`;
        if (!(cardKey in cardMoves)) {
            cardMoves[cardKey] = 0;
        }
        cardMoves[cardKey]++;
    }
    const averageMovesPerCard = Object.keys(cardMoves).length > 0
        ? Object.values(cardMoves).reduce((sum, moves) => sum + moves, 0) /
            Object.keys(cardMoves).length
        : 0;
    return {
        totalCards,
        cardsByBucket,
        successRate,
        averageMovesPerCard,
        totalPracticeEvents: totalAnswers,
    };
}
