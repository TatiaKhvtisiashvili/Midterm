"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const state_1 = require("./state");
const algorithm_1 = require("./logic/algorithm");
const flashcards_1 = require("./logic/flashcards");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// GET /api/practice
app.get("/api/practice", (req, res) => {
    try {
        const day = (0, state_1.getCurrentDay)();
        const bucketsMap = (0, state_1.getBuckets)();
        const bucketSets = (0, algorithm_1.toBucketSets)(bucketsMap);
        const practiceCards = (0, algorithm_1.practice)(bucketSets, day);
        const cardsArray = Array.from(practiceCards);
        console.log(`Day ${day}: Practice ${cardsArray.length} cards`);
        res.json({ cards: cardsArray, day }); // I'm guessing this does an implicit return, never touched express
    }
    catch (error) {
        console.error("Error getting practice cards:", error);
        res.status(500).json({ message: "Error fetching practice cards" });
    }
});
// POST /api/update
app.post("/api/update", (req, res) => {
    try {
        const { cardFront, cardBack, difficulty } = req.body;
        // Validate difficulty
        if (!Object.values(flashcards_1.AnswerDifficulty).includes(difficulty)) {
            res.status(400).json({ message: "Invalid difficulty level" });
            return;
        }
        // Find card
        const card = (0, state_1.findCard)(cardFront, cardBack);
        if (!card) {
            res.status(404).json({ message: "Card not found" });
            return;
        }
        // Get current buckets and track previous bucket
        const currentBuckets = (0, state_1.getBuckets)();
        const previousBucket = (0, state_1.findCardBucket)(card);
        // Update buckets
        const updatedBuckets = (0, algorithm_1.update)(currentBuckets, card, difficulty);
        (0, state_1.setBuckets)(updatedBuckets);
        // Create and add history record
        const newBucket = (0, state_1.findCardBucket)(card);
        if (previousBucket !== undefined && newBucket !== undefined) {
            const record = {
                cardFront: card.front,
                cardBack: card.back,
                timestamp: Date.now(),
                difficulty,
                previousBucket,
                newBucket
            };
            (0, state_1.addHistoryRecord)(record);
        }
        console.log(`Updated card "${card.front}": Bucket ${previousBucket} → ${newBucket}`);
        res.status(200).json({ message: "Card updated successfully" });
    }
    catch (error) {
        console.error("Error updating card:", error);
        res.status(500).json({ message: "Error updating card" });
    }
});
// GET /api/hint
app.get("/api/hint", (req, res) => {
    try {
        const { cardFront, cardBack } = req.query;
        // Validate query params
        if (typeof cardFront !== "string" || typeof cardBack !== "string") {
            res.status(400).json({ message: "Invalid query parameters" });
            return;
        }
        // Find card
        const card = (0, state_1.findCard)(cardFront, cardBack);
        if (!card) {
            res.status(404).json({ message: "Card not found" });
            return;
        }
        // Get hint
        const hint = (0, algorithm_1.getHint)(card);
        console.log(`Hint for "${card.front}": ${hint}`);
        res.json({ hint });
    }
    catch (error) {
        console.error("Error getting hint:", error);
        res.status(500).json({ message: "Error getting hint" });
    }
});
// GET /api/progress
app.get("/api/progress", (_req, res) => {
    try {
        const buckets = (0, state_1.getBuckets)();
        const history = (0, state_1.getHistory)();
        // Calculate progress statistics
        const progress = (0, algorithm_1.computeProgress)(buckets, history);
        console.log("Generated progress stats");
        res.json(progress);
    }
    catch (error) {
        console.error("Error computing progress:", error);
        res.status(500).json({ message: "Error computing progress" });
    }
});
// POST /api/day/next
app.post("/api/day/next", (_req, res) => {
    try {
        (0, state_1.incrementDay)();
        const newDay = (0, state_1.getCurrentDay)();
        console.log(`Advanced to Day ${newDay}`);
        res.status(200).json({
            message: `Advanced to day ${newDay}`,
            currentDay: newDay
        });
    }
    catch (error) {
        console.error("Error advancing day:", error);
        res.status(500).json({ message: "Error advancing day" });
    }
});
// POST /api/cards - Add a new flashcard
app.post("/api/cards", (req, res) => {
    try {
        const { front, back, hint, tags } = req.body;
        // Validate required fields
        if (!front || !back) {
            res.status(400).json({ message: "Front and back text are required" });
            return;
        }
        // Create new flashcard
        const newCard = new flashcards_1.Flashcard(front, back, hint, tags || []);
        // Get current buckets
        const currentBuckets = (0, state_1.getBuckets)();
        // Add to bucket 0 (new cards)
        if (!currentBuckets.has(0)) {
            currentBuckets.set(0, new Set());
        }
        const bucket0 = currentBuckets.get(0);
        if (bucket0) {
            bucket0.add(newCard);
        }
        // Update state
        (0, state_1.setBuckets)(currentBuckets);
        console.log(`Added new card: "${front}"`);
        res.status(201).json({
            message: "Card added successfully",
            card: { front, back, hint, tags: tags || [] },
        });
    }
    catch (error) {
        console.error("Error adding card:", error);
        res.status(500).json({ message: "Error adding card" });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Current Day: ${(0, state_1.getCurrentDay)()}`);
    console.log("Available endpoints:");
    console.log("- GET  /api/practice");
    console.log("- POST /api/update");
    console.log("- GET  /api/hint");
    console.log("- GET  /api/progress");
    console.log("- POST /api/day/next");
    console.log("- POST /api/cards");
});
