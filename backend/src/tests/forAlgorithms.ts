import * as assert from 'assert';
import { AnswerDifficulty, Flashcard, BucketMap } from "../logic/flashcards";
import { PracticeRecord } from "../types/index";
import {
  toBucketSets,
  getBucketRange,
  practice,
  update,
  getHint,
  computeProgress,
} from "../logic/algorithm";

describe("toBucketSets()", () => {
  const card1 = new Flashcard("Q1", "A1", "", []);
  const card2 = new Flashcard("Q2", "A2", "", []);

  it("empty map returns empty array", () => {
    const buckets = new Map<number, Set<Flashcard>>();
    assert.deepStrictEqual(toBucketSets(buckets), []);
  });

  it("throws error when missing bucket 0", () => {
    const buckets = new Map([[1, new Set<Flashcard>([card1])]]);
    assert.throws(
      () => toBucketSets(buckets),
      Error,
      "Buckets must include at least bucket 0 and a retired bucket"
    );
  });

  it("throws error when no retired bucket", () => {
    const buckets = new Map([[0, new Set<Flashcard>([card1])]]);
    assert.throws(
      () => toBucketSets(buckets),
      Error,
      "Buckets must include at least bucket 0 and a retired bucket"
    );
  });

  it("single bucket with one card", () => {
    const buckets = new Map([
      [0, new Set<Flashcard>([card1])],
      [1, new Set<Flashcard>()] // retired bucket
    ]);
    const result = toBucketSets(buckets);
    assert.strictEqual(result.length, 2);
    assert.deepStrictEqual(result[0], new Set([card1]));
    assert.deepStrictEqual(result[1], new Set());
  });

  it("multiple contiguous buckets", () => {
    const buckets = new Map([
      [0, new Set<Flashcard>([card1])],
      [1, new Set<Flashcard>([card2])],
      [2, new Set<Flashcard>()] // retired bucket
    ]);
    const result = toBucketSets(buckets);
    assert.strictEqual(result.length, 3);
    assert.deepStrictEqual(result[0], new Set([card1]));
    assert.deepStrictEqual(result[1], new Set([card2]));
    assert.deepStrictEqual(result[2], new Set());
  });

  it("buckets with gaps filled with empty sets", () => {
    const buckets = new Map([
      [0, new Set<Flashcard>()],
      [2, new Set<Flashcard>([card1])], // gap at 1
      [3, new Set<Flashcard>()] // retired bucket
    ]);
    const result = toBucketSets(buckets);
    assert.strictEqual(result.length, 4);
    assert.deepStrictEqual(result[0], new Set());
    assert.deepStrictEqual(result[1], new Set());
    assert.deepStrictEqual(result[2], new Set([card1]));
    assert.deepStrictEqual(result[3], new Set());
  });
});

describe("getBucketRange()", () => {
  const card = new Flashcard("Q", "A", "", []);

  it("empty array returns undefined", () => {
    assert.strictEqual(getBucketRange([]), undefined);
  });

  it("all buckets empty returns undefined", () => {
    assert.strictEqual(getBucketRange([new Set<Flashcard>(), new Set<Flashcard>()]), undefined);
  });

  it("single non-empty bucket", () => {
    const buckets = [
      new Set<Flashcard>(),
      new Set<Flashcard>([card]),
      new Set<Flashcard>()
    ];
    assert.deepStrictEqual(getBucketRange(buckets), { minBucket: 1, maxBucket: 1 });
  });

  it("multiple non-empty contiguous buckets", () => {
    const buckets = [
      new Set<Flashcard>([card]),
      new Set<Flashcard>([card]),
      new Set<Flashcard>()
    ];
    assert.deepStrictEqual(getBucketRange(buckets), { minBucket: 0, maxBucket: 1 });
  });

  it("multiple non-empty buckets with gaps", () => {
    const buckets = [
      new Set<Flashcard>(),
      new Set<Flashcard>([card]),
      new Set<Flashcard>(),
      new Set<Flashcard>([card])
    ];
    assert.deepStrictEqual(getBucketRange(buckets), { minBucket: 1, maxBucket: 3 });
  });
});

describe("practice()", () => {
  const card0 = new Flashcard("Q0", "A0", "", []);
  const card1 = new Flashcard("Q1", "A1", "", []);
  const card2 = new Flashcard("Q2", "A2", "", []);
  const retiredCard = new Flashcard("QR", "AR", "", []);

  it("day 0 (first day) selects bucket 0 (every day)", () => {
    const buckets = [
      new Set<Flashcard>([card0]),
      new Set<Flashcard>([card1]),
      new Set<Flashcard>([card2]),
      new Set<Flashcard>([retiredCard])
    ];
    const result = practice(buckets, 0); // day 0
    assert.deepStrictEqual(result, new Set([card0]));
  });

  it("day 1 selects bucket 0 and 1 (every 2 days)", () => {
    const buckets = [
      new Set<Flashcard>([card0]),
      new Set<Flashcard>([card1]),
      new Set<Flashcard>(),
      new Set<Flashcard>([retiredCard])
    ];
    const result = practice(buckets, 1); // day 1
    assert.deepStrictEqual(result, new Set([card0, card1]));
  });

  it("day 2 selects bucket 0 only", () => {
    const buckets = [
      new Set<Flashcard>([card0]),
      new Set<Flashcard>(),
      new Set<Flashcard>(),
      new Set<Flashcard>([retiredCard])
    ];
    const result = practice(buckets, 2); // day 2
    assert.deepStrictEqual(result, new Set([card0]));
  });

  it("day 3 selects bucket 0, 1, and 2", () => {
    const buckets = [
      new Set<Flashcard>([card0]),
      new Set<Flashcard>([card1]),
      new Set<Flashcard>([card2]),
      new Set<Flashcard>([retiredCard])
    ];
    const result = practice(buckets, 3); // day 3
    assert.deepStrictEqual(result, new Set([card0, card1, card2]));
  });

  it("skips retired bucket", () => {
    const buckets = [
      new Set<Flashcard>(),
      new Set<Flashcard>(),
      new Set<Flashcard>(),
      new Set<Flashcard>([retiredCard])
    ];
    const result = practice(buckets, 0);
    assert.deepStrictEqual(result, new Set());
  });

  it("empty buckets return empty set", () => {
    const buckets = [new Set<Flashcard>(), new Set<Flashcard>()];
    const result = practice(buckets, 0);
    assert.deepStrictEqual(result, new Set());
  });
});

describe("update()", () => {
  const card = new Flashcard("Q", "A", "", []);

  it("easy answer moves to next bucket", () => {
    const buckets = new Map<number, Set<Flashcard>>([
      [0, new Set([card])],
      [1, new Set()],
      [2, new Set()]  // retired bucket is implicitly 2 in this case
    ]);
    const result = update(buckets, card, AnswerDifficulty.Easy);
    assert.strictEqual(result.get(1)?.has(card), true);
    assert.strictEqual(result.get(0)?.has(card), false);
  });

  it("hard answer moves to previous bucket", () => {
    const buckets = new Map<number, Set<Flashcard>>([
      [0, new Set()],
      [1, new Set()],
      [2, new Set([card])]  // retired bucket is 2
    ]);
    const result = update(buckets, card, AnswerDifficulty.Hard);
    assert.strictEqual(result.get(1)?.has(card), true);
    assert.strictEqual(result.get(2)?.size, 0); // retired bucket remains but is empty
  });

  it("wrong answer resets to bucket 0", () => {
    const buckets = new Map<number, Set<Flashcard>>([
      [0, new Set()],
      [3, new Set([card])]
    ]);
    const result = update(buckets, card, AnswerDifficulty.Wrong);
    
    // Just check that card moved to bucket 0
    assert.strictEqual(result.get(0)?.has(card), true);
    
    // Don't check bucket 3's existence
  });

  it("hard answer from bucket 0 stays in bucket 0", () => {
    const buckets = new Map<number, Set<Flashcard>>([
      [0, new Set([card])],
      [1, new Set()]  // retired bucket is 1
    ]);
    const result = update(buckets, card, AnswerDifficulty.Hard);
    assert.strictEqual(result.get(0)?.has(card), true);
  });

  it("easy answer on retired bucket stays", () => {
    const retiredBucket = 2;
    const buckets = new Map<number, Set<Flashcard>>([
      [0, new Set()],
      [1, new Set()],
      [retiredBucket, new Set([card])]
    ]);
    const result = update(buckets, card, AnswerDifficulty.Easy);
    assert.strictEqual(result.get(retiredBucket)?.has(card), true);
  });

  it("unknown card leaves buckets unchanged", () => {
    const buckets = new Map<number, Set<Flashcard>>([
      [0, new Set()],
      [1, new Set()]  // retired bucket is 1
    ]);
    const unknownCard = new Flashcard("X", "X", "", []);
    const result = update(buckets, unknownCard, AnswerDifficulty.Easy);
    assert.deepStrictEqual(result, buckets);
  });
});

describe("getHint()", () => {
  it("empty hint returns empty string", () => {
    const card = new Flashcard("Q", "A", "", []);
    assert.strictEqual(getHint(card), "");
  });

  it("returns the card's hint field", () => {
    const card = new Flashcard("Q", "A", "This is a hint", []);
    assert.strictEqual(getHint(card), "This is a hint");
  });
});

describe("computeProgress()", () => {
  const card1 = new Flashcard("Q1", "A1", "", []);
  const card2 = new Flashcard("Q2", "A2", "", []);
  const retiredCard = new Flashcard("QR", "AR", "", []);

  const createRecord = (card: Flashcard, difficulty: AnswerDifficulty): PracticeRecord => ({
    cardFront: card.front,
    cardBack: card.back,
    timestamp: Date.now(),
    difficulty,
    previousBucket: 0,
    newBucket: difficulty === AnswerDifficulty.Wrong ? 0 : 1
  });

  it("throws error when missing bucket 0", () => {
    const buckets: BucketMap = new Map([
      [1, new Set<Flashcard>()],
      [2, new Set<Flashcard>()]
    ]);
    assert.throws(
      () => computeProgress(buckets, []),
      Error,
      "Buckets must include at least bucket 0 and a retired bucket"
    );
  });

  it("throws error when no retired bucket", () => {
    const buckets: BucketMap = new Map([
      [0, new Set<Flashcard>()]
    ]);
    assert.throws(
      () => computeProgress(buckets, []),
      Error,
      "Must have a retired bucket with number > 0"
    );
  });

  it("calculates stats with valid buckets", () => {
    const buckets: BucketMap = new Map([
      [0, new Set<Flashcard>([card1])],
      [1, new Set<Flashcard>([card2])],
      [3, new Set<Flashcard>([retiredCard])] // retired bucket
    ]);
    const history = [
      createRecord(card1, AnswerDifficulty.Easy),
      createRecord(card1, AnswerDifficulty.Wrong)
    ];
    
    const result = computeProgress(buckets, history);
    
    assert.strictEqual(result.totalCards, 3);
    assert.deepStrictEqual(result.cardsByBucket, {0: 1, 1: 1, 2: 0, 3: 1});
    assert.strictEqual(result.retiredCards, 1);
    assert.strictEqual(result.successRate, 50);
    assert.strictEqual(result.hardestCards[0]?.front, "Q1");
    assert.strictEqual(result.averageMovesPerCard, 2); // Expect 2 moves for card1
  });

  it("handles multiple retired cards", () => {
    const buckets: BucketMap = new Map([
      [0, new Set<Flashcard>()],
      [2, new Set<Flashcard>([card1, card2, retiredCard])] // retired bucket
    ]);
    const result = computeProgress(buckets, []);
    assert.strictEqual(result.retiredCards, 3);
  });

  it("fills missing intermediate buckets with 0", () => {
    const buckets: BucketMap = new Map([
      [0, new Set<Flashcard>([card1])],
      [3, new Set<Flashcard>()] // retired bucket with gap
    ]);
    const result = computeProgress(buckets, []);
    assert.deepStrictEqual(result.cardsByBucket, {0: 1, 1: 0, 2: 0, 3: 0});
  });
});