import request from 'supertest';
import * as assert from 'assert';
import { app } from '../server';
import { Flashcard } from '../logic/flashcards';
import { getBuckets, setBuckets, addHistoryRecord, getHistory, resetState, getCurrentDay } from '../state';
import { AnswerDifficulty } from '../logic/flashcards';

describe('API Endpoints', () => {
  // Test data
  const TEST_CARD = {
    front: "TestQ",
    back: "TestA",
    hint: "TestHint",
    tags: ["test"]
  };

  beforeEach(() => {
    // Reset and initialize state with required buckets
    resetState();
    
    // Manually set up initial state with test card and required buckets
    const buckets = new Map<number, Set<Flashcard>>();
    buckets.set(0, new Set([new Flashcard(TEST_CARD.front, TEST_CARD.back, TEST_CARD.hint, TEST_CARD.tags)]));
    buckets.set(1, new Set()); // Learning bucket
    buckets.set(2, new Set()); // Retirement bucket
    setBuckets(buckets);
  });

  describe('GET /api/practice', () => {
    it('should return practice cards for current day', async () => {
      const response = await request(app)
        .get('/api/practice')
        .expect(200);
      
      assert.ok(Array.isArray(response.body.cards));
      assert.strictEqual(typeof response.body.day, 'number');
    });
  });

  describe('POST /api/update', () => {
    it('should move card to next bucket on Easy', async () => {
      const response = await request(app)
        .post('/api/update')
        .send({
          cardFront: TEST_CARD.front,
          cardBack: TEST_CARD.back,
          difficulty: AnswerDifficulty.Easy
        })
        .expect(200);
      
      assert.strictEqual(response.body.message, "Card updated successfully");
      
      // Verify card moved to bucket 1
      const buckets = getBuckets();
      assert.strictEqual(buckets.get(0)?.size, 0);
      assert.strictEqual(buckets.get(1)?.size, 1);
    });

    it('should move card to previous bucket on Hard', async () => {
        // Initial setup
        let buckets = getBuckets();
        console.log('Initial buckets:', [...buckets.keys()]); // [0, 1, 2]
        
        // Move card to bucket 1
        const card = [...buckets.get(0)!][0];
        buckets.get(0)?.delete(card);
        buckets.get(1)?.add(card);
        setBuckets(buckets);
        
        console.log('After manual move to bucket 1:', 
          [...getBuckets().entries()].map(([k,v]) => [k, v.size])); // [[0,0], [1,1], [2,0]]
      
        // Make the API call
        const response = await request(app)
          .post('/api/update')
          .send({
            cardFront: TEST_CARD.front,
            cardBack: TEST_CARD.back,
            difficulty: AnswerDifficulty.Hard
          });
      
        // Check final state
        buckets = getBuckets();
        console.log('After Hard update:', 
          [...buckets.entries()].map(([k,v]) => [k, v.size])); //[ [ 0, 1 ], [ 2, 0 ] ]
        
        assert.strictEqual(buckets.get(0)?.size, 1);
      });
      
    it('should reject invalid difficulty', async () => {
      const response = await request(app)
        .post('/api/update')
        .send({
          cardFront: TEST_CARD.front,
          cardBack: TEST_CARD.back,
          difficulty: "Invalid"
        })
        .expect(400);
      
      assert.strictEqual(response.body.message, "Invalid difficulty level");
    });
  });

  describe('GET /api/hint', () => {
    it('should return hint for existing card', async () => {
      const response = await request(app)
        .get('/api/hint')
        .query({ cardFront: TEST_CARD.front, cardBack: TEST_CARD.back })
        .expect(200);
      
      assert.strictEqual(response.body.hint, TEST_CARD.hint);
    });
  });

  describe('GET /api/progress', () => {
    it('should return progress stats', async () => {
      // Add practice history
      addHistoryRecord({
        cardFront: TEST_CARD.front,
        cardBack: TEST_CARD.back,
        timestamp: Date.now(),
        difficulty: AnswerDifficulty.Easy,
        previousBucket: 0,
        newBucket: 1
      });

      const response = await request(app)
        .get('/api/progress')
        .expect(200);
      
      assert.strictEqual(response.body.totalCards, 1);
      assert.strictEqual(response.body.retiredCards, 0);
      assert.ok(Array.isArray(response.body.hardestCards));
    });
  });

  describe('POST /api/day/next', () => {
    it('should increment the day counter', async () => {
      const initialDay = getCurrentDay();
      
      const response = await request(app)
        .post('/api/day/next')
        .expect(200);
      
      assert.strictEqual(response.body.currentDay, initialDay + 1);
    });
  });

  describe('POST /api/cards', () => {
    const NEW_CARD = {
      front: "NewQ",
      back: "NewA",
      hint: "NewHint",
      tags: ["new"]
    };

    it('should create a new flashcard', async () => {
      const response = await request(app)
        .post('/api/cards')
        .send(NEW_CARD)
        .expect(201);
      
      // Verify card was added to bucket 0
      const buckets = getBuckets();
      assert.strictEqual(buckets.get(0)?.size, 2); // Test card + new card
    });
  });
});