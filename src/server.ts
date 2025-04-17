import express, { ErrorRequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import cors from 'cors';
import * as logic from './logic/algorithm';
import * as state from './state';
import { Flashcard, AnswerDifficulty } from './logic/flashcards';
import { PracticeRecord, HintRequest, UpdateRequest, ProgressStats } from './types/index';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware type definitions
type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: err.message 
  });
};

// Route: Get Practice Cards
const getPracticeCards: ExpressMiddleware = (req, res, next) => {
  try {
    const day = state.getCurrentDay();
    const bucketsMap = state.getBuckets();
    const bucketSets = logic.toBucketSets(bucketsMap);
    
    const cards = logic.practice(bucketSets, day);
    const cardsArray = Array.from(cards);
    
    console.log(`Practice cards found: ${cardsArray.length}`);
    
    res.json({ cards: cardsArray, day });
  } catch (error) {
    next(error);
  }
};

// Route: Update Card
const updateCard: ExpressMiddleware = (req, res, next) => {
  try {
    const { cardFront, cardBack, difficulty }: UpdateRequest = req.body;
    
    // Validate difficulty
    if (!Object.values(AnswerDifficulty).includes(difficulty)) {
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
      const practiceRecord: PracticeRecord = {
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
  } catch (error) {
    next(error);
  }
};

// Route: Get Hint
const getHint: ExpressMiddleware = (req, res, next) => {
  try {
    const cardFront = req.query.cardFront as string;
    const cardBack = req.query.cardBack as string;
    
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
  } catch (error) {
    next(error);
  }
};

// Route: Get Progress
const getProgress: ExpressMiddleware = (req, res, next) => {
  try {
    const buckets = state.getBuckets();
    const history = state.getHistory();
    
    const progressStats: ProgressStats = logic.computeProgress(buckets, history);
    
    res.json(progressStats);
  } catch (error) {
    next(error);
  }
};

// Route: Increment Day
const incrementDay: ExpressMiddleware = (req, res, next) => {
  try {
    state.incrementDay();
    const newDay = state.getCurrentDay();
    
    console.log(`Advanced to day: ${newDay}`);
    
    res.status(200).json({ 
      message: 'Day incremented successfully', 
      day: newDay 
    });
  } catch (error) {
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

export { app, server };