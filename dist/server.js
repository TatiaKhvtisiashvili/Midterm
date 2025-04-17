"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logic = __importStar(require("./logic/algorithm"));
const state = __importStar(require("./state"));
const flashcards_1 = require("./logic/flashcards");
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: err.message
    });
};
// Route: Get Practice Cards
const getPracticeCards = (req, res, next) => {
    try {
        const day = state.getCurrentDay();
        const bucketsMap = state.getBuckets();
        const bucketSets = logic.toBucketSets(bucketsMap);
        const cards = logic.practice(bucketSets, day);
        const cardsArray = Array.from(cards);
        console.log(`Practice cards found: ${cardsArray.length}`);
        res.json({ cards: cardsArray, day });
    }
    catch (error) {
        next(error);
    }
};
// Route: Update Card
const updateCard = (req, res, next) => {
    try {
        const { cardFront, cardBack, difficulty } = req.body;
        // Validate difficulty
        if (!Object.values(flashcards_1.AnswerDifficulty).includes(difficulty)) {
            return res.status(400).json({ message: 'Invalid difficulty' });
        }
        // Find the card
        const card = state.findCard(cardFront, cardBack);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        const currentBuckets = state.getBuckets();
        const previousBucket = state.findCardBucket(card);
        // Update buckets
        const updatedBuckets = logic.update(currentBuckets, card, difficulty);
        state.setBuckets(updatedBuckets);
        // Track practice history
        const newBucket = state.findCardBucket(card);
        if (previousBucket !== undefined && newBucket !== undefined) {
            const practiceRecord = {
                cardFront,
                cardBack,
                timestamp: Date.now(),
                difficulty,
                previousBucket,
                newBucket
            };
            state.addHistoryRecord(practiceRecord);
        }
        console.log(`Updated card: ${cardFront} to difficulty ${difficulty}`);
        res.status(200).json({ message: 'Card updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
// Route: Get Hint
const getHint = (req, res, next) => {
    try {
        const cardFront = req.query.cardFront;
        const cardBack = req.query.cardBack;
        // Validate query parameters
        if (!cardFront || !cardBack) {
            return res.status(400).json({
                message: 'Missing cardFront or cardBack query parameters'
            });
        }
        // Find the card
        const card = state.findCard(cardFront, cardBack);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        const hint = logic.getHint(card);
        console.log(`Hint requested for card: ${cardFront}`);
        res.json({ hint });
    }
    catch (error) {
        next(error);
    }
};
// Route: Get Progress
const getProgress = (req, res, next) => {
    try {
        const buckets = state.getBuckets();
        const history = state.getHistory();
        const progressStats = logic.computeProgress(buckets, history);
        res.json(progressStats);
    }
    catch (error) {
        next(error);
    }
};
// Route: Increment Day
const incrementDay = (req, res, next) => {
    try {
        state.incrementDay();
        const newDay = state.getCurrentDay();
        console.log(`Advanced to day: ${newDay}`);
        res.status(200).json({
            message: 'Day incremented successfully',
            day: newDay
        });
    }
    catch (error) {
        next(error);
    }
};
// Register routes
app.get('/api/practice', getPracticeCards);
app.post('/api/update', updateCard);
app.get('/api/hint', getHint);
app.get('/api/progress', getProgress);
app.post('/api/day/next', incrementDay);
// Add error handling middleware
app.use(errorHandler);
// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Flashcard application server started successfully`);
});
exports.server = server;
