Specification: Full-Stack Flashcard Application (v1.0 - Build Instructions Scope)

Version: 1.0
Date: [Current Date]

1. Overview

This document specifies the requirements for building a full-stack flashcard application based on the provided "Full-Stack Flashcard App - Build Instructions". It utilizes an existing flashcard algorithm (algorithm.ts, flashcards.ts), a Node.js/Express backend with in-memory state, and a React/Vite frontend.

The core functionality involves:

Fetching practice cards due for the current simulated day.

Displaying cards one by one (front, then back).

Allowing users to rate their recall difficulty.

Updating card state based on difficulty using the provided algorithm.

Providing optional hints.

Tracking basic progress statistics.

Advancing the simulation day.

Scope Note: This specification covers only the features detailed within the main build instructions (Phases 1-5). Features like persistence, LLM integration, browser extensions, or hand gestures are considered future enhancements outside this scope.

2. System Baseline and Core Definitions
2.1. Technology Stack

Backend: Node.js, TypeScript, Express

Frontend: React, Vite, TypeScript, Axios

Algorithm: Pre-defined functions in backend/src/logic/algorithm.ts and backend/src/logic/flashcards.ts.

2.2. State Management

Mechanism: In-memory state managed within the backend process using backend/src/state.ts.

Persistence: None. State resets on server restart as per the build instructions. Persistence is out of scope for this version.

2.3. Core Data Structures (Backend)

Flashcard: Defined in flashcards.ts. Contains at least front: string and back: string. May contain hint: string. Identification relies on front and back values.

AnswerDifficulty: Enum defined in flashcards.ts (e.g., Wrong, Hard, Easy).

BucketMap: Type Map<number, Set<Flashcard>>. Stores card distribution across learning buckets. Managed in state.ts.

PracticeRecord: Interface { cardFront: string, cardBack: string, timestamp: number, difficulty: AnswerDifficulty, previousBucket: number, newBucket: number }. Managed as an array (practiceHistory) in state.ts.

currentDay: Type number. Represents the simulation day. Managed in state.ts.

2.4. Core API Endpoints (Summary)

The backend exposes the following core endpoints under the /api base path:

GET /practice: Get cards for the current day's practice session.

POST /update: Update a card's bucket based on user-provided difficulty.

GET /hint: Get a hint for a specific card.

GET /progress: Get learning statistics.

POST /day/next: Advance the simulation day.

3. Backend API Endpoint Details

Base URL: /api (e.g., http://localhost:3001/api)
Middleware: cors(), express.json()

3.1. Standard Error Response Format

For all 4xx (Client Error) and 5xx (Server Error) HTTP responses, the response body must adhere to:

interface ErrorResponse {
  error: string;   // Machine-readable code (e.g., "CARD_NOT_FOUND")
  message: string; // User-friendly description
}

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

Errors: 500 Internal Server Error.

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

Validate difficulty. Return 400 if invalid (error: "INVALID_DIFFICULTY").

Find card via front/back. Return 404 if not found (error: "CARD_NOT_FOUND").

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

Validate query params. Return 400 if missing/invalid (error: "MISSING_QUERY_PARAM").

Find card via front/back. Return 404 if not found (error: "CARD_NOT_FOUND").

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

4. Frontend Implementation Details
4.1. API Service (src/services/api.ts)

Purpose: Encapsulates all backend API calls using Axios.

Exports:

fetchPracticeCards(): Promise<PracticeSession>

submitAnswer(cardFront: string, cardBack: string, difficulty: AnswerDifficulty): Promise<void>

fetchHint(cardFront: string, cardBack: string): Promise<string>

fetchProgress(): Promise<ProgressStats>

advanceDay(): Promise<number>

Configuration: Requires an Axios instance configured with the backend base URL.

4.2. FlashcardDisplay.tsx Component

Purpose: Renders a single flashcard; handles hint display.

Props:

interface FlashcardDisplayProps {
  card: { front: string; back: string; };
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

5. Testing Considerations (Manual)

While formal tests are not specified in the build instructions, manual testing should verify:

Practice Loop: Cards load correctly (GET /practice), showing answer reveals back, difficulty submission updates card state (POST /update), hints work (GET /hint), session completion message appears, advancing day works (POST /day/next) and loads new cards.

Error Handling: Frontend displays appropriate messages for API errors (e.g., card not found, server error).

State: Backend logs indicate state changes correctly (card movement between buckets, history recording).

Progress: GET /api/progress endpoint returns data in the expected ProgressStats format (verify via direct API call or placeholder UI).