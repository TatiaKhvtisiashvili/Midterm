Specification: Full-Stack Flashcard Application (v1.1 - Card Addition Scope)

1. Overview

This document specifies the requirements for building and extending a full-stack flashcard application. It utilizes an existing flashcard algorithm (algorithm.ts, flashcards.ts), a Node.js/Express backend (`server.ts`) with in-memory state, and a React/Vite frontend.

The core functionality involves:

*   Fetching practice cards due for the current simulated day.
*   Displaying cards one by one (front, then back).
*   Allowing users to rate their recall difficulty.
*   Updating card state based on difficulty using the provided algorithm.
*   Providing optional hints.
*   Tracking basic progress statistics.
*   Advancing the simulation day.
*   **NEW:** Adding new flashcards via a dedicated API endpoint (e.g., for use by a browser extension).

Scope Note: This specification primarily covers the features detailed within the original build instructions (Phases 1-5), plus the addition of the card creation API. Features like advanced persistence beyond server restart, full LLM integration, a complete browser extension UI, or hand gestures are considered future enhancements outside this scope. The *capability* to add cards via API is now included.

2. System Baseline and Core Definitions
2.1. Technology Stack

*   Backend: Node.js, TypeScript, Express (`server.ts`)
*   Frontend: React, Vite, TypeScript, Axios
*   Algorithm: Pre-defined functions in `backend/src/logic/algorithm.ts` and `backend/src/logic/flashcards.ts`.

2.2. State Management

*   Mechanism: In-memory state managed within the backend process using `backend/src/state.ts`.
*   Persistence: None. State resets on server restart. Persistence is out of scope for this version.

2.3. Core Data Structures (Backend)

*   `Flashcard`: Defined in `flashcards.ts`. Contains `front: string`, `back: string`, optional `hint: string`, and optional `tags: string[]`. Identification primarily relies on `front` and `back` values for updates, but new cards are distinct objects.
*   `AnswerDifficulty`: Enum defined in `flashcards.ts` (e.g., `Wrong`, `Hard`, `Easy`).
*   `BucketMap`: Type `Map<number, Set<Flashcard>>`. Stores card distribution across learning buckets. Managed in `state.ts`. New cards are added to bucket 0.
*   `PracticeRecord`: Interface `{ cardFront: string, cardBack: string, timestamp: number, difficulty: AnswerDifficulty, previousBucket: number, newBucket: number }`. Managed as an array (`practiceHistory`) in `state.ts`.
*   `currentDay`: Type `number`. Represents the simulation day. Managed in `state.ts`.

2.4. Core API Endpoints (Summary)

The backend exposes the following core endpoints under the `/api` base path:

*   `GET /practice`: Get cards for the current day's practice session.
*   `POST /update`: Update a card's bucket based on user-provided difficulty.
*   `GET /hint`: Get a hint for a specific card.
*   `GET /progress`: Get learning statistics.
*   `POST /day/next`: Advance the simulation day.
*   **NEW:** `POST /cards`: Add a new flashcard.

3. Backend API Endpoint Details

Base URL: `/api` (e.g., `http://localhost:3001/api`)
Middleware: `cors()`, `express.json()`

3.1. Standard Error Response Format

For all 4xx (Client Error) and 5xx (Server Error) HTTP responses, the response body should ideally adhere to:

```typescript
interface ErrorResponse {
  error: string;   // Machine-readable code (e.g., "CARD_NOT_FOUND")
  message: string; // User-friendly description
}
// Note: Some endpoints might use a simpler { message: string } format initially.


3.2. GET /practice

Purpose: Get flashcards due for practice today.

Request: None.

Logic:

Get currentDay, currentBuckets from state.

Convert currentBuckets to Array<Set<Flashcard>> (logic.toBucketSets).

Call logic.practice to get due cards (Set<Flashcard>).

Format result as [{ front, back }, ...].

Success Response (200 OK):

interface PracticeSession {
  day: number;
  cards: { front: string; back: string; }[];
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Errors: 500 Internal Server Error ({ error: "INTERNAL_ERROR", message: "..." }).

3.3. POST /update

Purpose: Update card state based on practice difficulty.

Request Body:

interface UpdateRequest {
  cardFront: string;
  cardBack: string;
  difficulty: AnswerDifficulty;
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Logic:

Validate difficulty. Return 400 if invalid ({ error: "INVALID_DIFFICULTY", message: "..." }).

Find card via front/back. Return 404 if not found ({ error: "CARD_NOT_FOUND", message: "..." }).

Get currentBuckets, find previousBucket.

Call logic.update to get newBuckets.

Update state: state.setBuckets(newBuckets).

Find newBucket from updated state.

Create and add PracticeRecord to history (state.addHistoryRecord).

Success Response (200 OK): (Body optional)

{ "success": true, "message": "Card updated successfully" }
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Json
IGNORE_WHEN_COPYING_END

Errors: 400 Bad Request, 404 Not Found, 500 Internal Server Error.

3.4. GET /hint

Purpose: Get hint for a specific card.

Request Query Params: cardFront (string, required), cardBack (string, required).

Logic:

Validate query params. Return 400 if missing/invalid ({ error: "MISSING_QUERY_PARAM", message: "..." }).

Find card via front/back. Return 404 if not found ({ error: "CARD_NOT_FOUND", message: "..." }).

Call logic.getHint(card) (returns hint string or "No hint..." message).

Success Response (200 OK):

interface HintResponse {
  hint: string;
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Errors: 400 Bad Request, 404 Not Found, 500 Internal Server Error.

3.5. GET /progress

Purpose: Get learning statistics.

Request: None.

Logic:

Get currentBuckets, practiceHistory from state.

Call logic.computeProgress(currentBuckets, practiceHistory).

Success Response (200 OK):

interface ProgressStats {
  totalCards: number;
  cardsPerBucket: { [bucketNumber: number]: number };
  overallAccuracy: number; // 0.0 to 1.0
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Errors: 500 Internal Server Error.

3.6. POST /day/next

Purpose: Advance simulation to the next day.

Request Body: None.

Logic:

Call state.incrementDay().

Get new currentDay from state.

Success Response (200 OK):

interface NextDayResponse {
  currentDay: number;
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Errors: 500 Internal Server Error.

3.7. NEW: POST /cards

Purpose: Add a new flashcard (e.g., from an extension).

Request Body:

interface AddCardRequest {
  front: string;      // Required
  back: string;       // Required
  hint?: string;      // Optional
  tags?: string[];    // Optional
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Logic:

Extract front, back, hint, tags from req.body.

Validate required fields (front, back). Return 400 if missing ({ message: "Front and back are required" }).

Create a new Flashcard instance (new Flashcard(front, back, hint, tags || [])).

Get currentBuckets from state.getBuckets().

Ensure bucket 0 exists (if (!currentBuckets.has(0)) { currentBuckets.set(0, new Set()); }).

Add the newCard to the Set in bucket 0.

Update state using state.setBuckets(currentBuckets).

Log the successful addition.

Success Response (201 Created):

{
  "message": "Card added successfully",
  "card": {
    "front": "string",
    "back": "string",
    "hint": "string | undefined",
    "tags": "string[]"
  }
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Json
IGNORE_WHEN_COPYING_END

Errors:

400 Bad Request: { message: "Front and back are required" } (If validation fails).

500 Internal Server Error: { message: "Error adding card" } (For unexpected errors during the process).

Frontend Implementation Details
4.1. API Service (src/services/api.ts)

Purpose: Encapsulates all backend API calls using Axios.

Exports:

fetchPracticeCards(): Promise<PracticeSession>

submitAnswer(cardFront: string, cardBack: string, difficulty: AnswerDifficulty): Promise<void>

fetchHint(cardFront: string, cardBack: string): Promise<string>

fetchProgress(): Promise<ProgressStats>

advanceDay(): Promise<number>

(Optional Future Addition: addCard(cardData: AddCardRequest): Promise<any>)

Configuration: Requires an Axios instance configured with the backend base URL.

4.2. FlashcardDisplay.tsx Component

Purpose: Renders a single flashcard; handles hint display.

Props:

interface FlashcardDisplayProps {
  card: { front: string; back: string; }; // Note: Hint/Tags not directly needed here for display
  showBack: boolean;
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Internal State: hint, loadingHint, hintError.

Rendering: Displays front, conditionally back/placeholder, hint button (when !showBack), hint text/error.

Functions: handleGetHint (calls api.fetchHint, manages hint state/loading/error).

4.3. PracticeView.tsx Component

Purpose: Manages the practice session lifecycle and UI.

Internal State: practiceCards, currentCardIndex, showBack, isLoading, error, day, sessionFinished.

Rendering: Handles loading/error states; displays card count/day; renders FlashcardDisplay; conditionally renders "Show Answer" / Difficulty buttons / "Session Complete" + "Next Day" button.

Functions:

loadPracticeCards: Fetches cards using api.fetchPracticeCards, updates state, handles empty/error cases, resets session state.

handleShowBack: Sets showBack = true.

handleAnswer: Calls api.submitAnswer, updates currentCardIndex or sets sessionFinished, resets showBack, handles errors.

handleNextDay: Calls api.advanceDay, then calls loadPracticeCards on success, handles errors.

Lifecycle: Calls loadPracticeCards on mount (useEffect).

4.4. App.tsx / main.tsx

Purpose: Application entry point and root component.

Setup: Standard Vite React TS setup.

App.tsx: Renders main title and <PracticeView />.

Testing Considerations (Manual)

While formal tests are not specified in the build instructions, manual testing should verify:

Practice Loop: Cards load correctly (GET /practice), showing answer reveals back, difficulty submission updates card state (POST /update), hints work (GET /hint), session completion message appears, advancing day works (POST /day/next) and loads new cards.

NEW: Card Addition: Use a tool like curl or Postman to send a valid POST /api/cards request. Verify a 201 response. Then, advance the day (if needed) and check if the new card appears in a future GET /api/practice request. Test invalid requests (missing front/back) return a 400.

Error Handling: Frontend displays appropriate messages for API errors (e.g., card not found, server error). Backend logs errors.

State: Backend logs indicate state changes correctly (card movement between buckets, history recording, card addition to bucket 0).

Progress: GET /api/progress endpoint returns data in the expected ProgressStats format (verify via direct API call or placeholder UI). Update reflects added cards.
