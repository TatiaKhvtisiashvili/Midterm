# TODO Checklist: Full-Stack Flashcard App (v1.0 - Build Instructions Scope)

## Phase 1: Backend Foundation & Setup

- [ ] **Step 1: Project Structure & Dependencies (Prompt 1)**
    - [ ] Create root `flashcard-app` directory.
    - [ ] Create `backend` subdirectory and navigate into it.
    - [ ] Initialize npm project: `npm init -y`.
    - [ ] Install runtime dependencies: `npm install express cors`.
    - [ ] Install dev dependencies: `npm install -D typescript @types/node @types/express @types/cors ts-node-dev`.
    - [ ] Verify `dependencies` and `devDependencies` in `backend/package.json`.
- [ ] **Step 2: TypeScript Configuration (Prompt 2)**
    - [ ] Create `backend/tsconfig.json`.
    - [ ] Populate `tsconfig.json` with the specified configuration (target, module, paths, etc.).
- [ ] **Step 3: Directories, Initial Files & Scripts (Prompt 3)**
    - [ ] Create backend source folders: `backend/src/logic`, `backend/src/types`.
    - [ ] Create initial backend files: `backend/src/server.ts`, `backend/src/state.ts`, `backend/src/types/index.ts`.
    - [ ] Add `main` property to `backend/package.json` (`dist/server.js`).
    - [ ] Add `scripts` (`build`, `start`, `dev`) to `backend/package.json`.
- [ ] **Step 4: Placeholder Algorithm Logic (Prompt 4)**
    - [ ] Create `backend/src/logic/flashcards.ts`.
        - [ ] Define and export basic `Flashcard` class (constructor with `front`, `back`, optional `hint`).
        - [ ] Define and export `AnswerDifficulty` enum (e.g., `Wrong`, `Hard`, `Easy`).
        - [ ] Define and export `BucketMap` type alias (`Map<number, Set<Flashcard>>`).
    - [ ] Create `backend/src/logic/algorithm.ts`.
        - [ ] Define and export placeholder `toBucketSets` function.
        - [ ] Define and export placeholder `practice` function.
        - [ ] Define and export placeholder `update` function.
        - [ ] Define and export placeholder `getHint` function (return default message).
        - [ ] Define and export placeholder `computeProgress` function (return empty object, type `any` for now).
- [ ] **Step 5: Shared Backend Types (Prompt 5)**
    - [ ] Edit `backend/src/types/index.ts`.
    - [ ] Import core types from `@logic/flashcards`.
    - [ ] Define and export `PracticeSession` interface.
    - [ ] Define and export `UpdateRequest` interface.
    *   [ ] Define and export `HintResponse` interface.
    *   [ ] Define and export `ProgressStats` interface.
    *   [ ] Define and export `NextDayResponse` interface.
    *   [ ] Define and export `PracticeRecord` interface.
    *   [ ] Define and export `ErrorResponse` interface.
    - [ ] Re-export imported core types.
- [ ] **Step 6: In-Memory State Management (Prompt 6)**
    - [ ] Edit `backend/src/state.ts`.
    - [ ] Import necessary types.
    - [ ] Define and initialize `initialCards` array with sample `Flashcard` objects.
    - [ ] Define and initialize state variables: `currentBuckets`, `practiceHistory`, `currentDay`.
    - [ ] Implement and export state accessors/mutators: `getBuckets`, `setBuckets`, `getHistory`, `addHistoryRecord`, `getCurrentDay`, `incrementDay`.
    - [ ] Implement and export helper `findCard(front, back)`.
    - [ ] Implement and export helper `findCardBucket(card)`.
    - [ ] Add confirmation `console.log` for initial load.
- [ ] **Step 7: Basic Express Server Setup (Prompt 7)**
    - [ ] Edit `backend/src/server.ts`.
    - [ ] Add imports: `express`, `cors`, state functions, logic functions, types.
    - [ ] Create Express `app` instance.
    - [ ] Define `PORT`.
    - [ ] Apply `cors()` and `express.json()` middleware.
    - [ ] Add `app.listen` with startup log message.

## Phase 2: Backend API Endpoint Implementation

- [ ] **Step 8: Implement `POST /api/day/next` (Prompt 8)**
    - [ ] Add route handler for `POST /api/day/next` in `server.ts`.
    - [ ] Implement logic: `try/catch`, call `state.incrementDay`, get `newDay`, log, send `NextDayResponse` (200) or `ErrorResponse` (500).
- [ ] **Step 9: Implement `GET /api/practice` (Prompt 9)**
    - [ ] Add route handler for `GET /api/practice` in `server.ts`.
    - [ ] Implement logic: `try/catch`, get state, call `logic.toBucketSets`, `logic.practice`, format result, log, send `PracticeSession` (200) or `ErrorResponse` (500).
- [ ] **Step 10: Implement `POST /api/update` (Prompt 10)**
    - [ ] Add route handler for `POST /api/update` in `server.ts`.
    - [ ] Implement logic: `try/catch`, extract body, validate `difficulty` (400), `state.findCard` (404), get `previousBucket`, call `logic.update`, `state.setBuckets`, get `newBucket`, create/add `PracticeRecord`, log, send success (200) or `ErrorResponse` (400/404/500).
- [ ] **Step 11: Implement `GET /api/hint` (Prompt 11)**
    - [ ] Add route handler for `GET /api/hint` in `server.ts`.
    - [ ] Implement logic: `try/catch`, extract query params, validate params (400), `state.findCard` (404), call `logic.getHint`, log, send `HintResponse` (200) or `ErrorResponse` (400/404/500).
- [ ] **Step 12: Implement `GET /api/progress` (Prompt 12)**
    - [ ] **Update `logic/algorithm.ts`:** Modify `computeProgress` signature and implement basic logic to return `ProgressStats` structure (calculate `totalCards`, placeholder `cardsPerBucket`/`overallAccuracy`).
    - [ ] **Update `server.ts`:** Add route handler for `GET /api/progress`.
    - [ ] Implement logic: `try/catch`, get state, call `logic.computeProgress`, send `ProgressStats` (200) or `ErrorResponse` (500).

## Phase 3: Frontend Foundation & Setup

- [ ] **Step 13: Project Creation & Dependencies (Prompt 13)**
    - [ ] Navigate to `flashcard-app` root.
    - [ ] Create frontend project: `npm create vite@latest frontend -- --template react-ts`.
    - [ ] Navigate into `frontend`.
    - [ ] Install Axios: `npm install axios`.
- [ ] **Step 14: Directories & Initial Files (Prompt 14)**
    - [ ] Create frontend source folders: `src/components`, `src/services`, `src/types`.
    - [ ] Create initial frontend files: `components/FlashcardDisplay.tsx`, `components/PracticeView.tsx`, `services/api.ts`, `types/index.ts`.
- [ ] **Step 15: Shared Frontend Types (Prompt 15)**
    - [ ] Edit `frontend/src/types/index.ts`.
    - [ ] Define and export `FlashcardData` interface (`{ front, back }`).
    - [ ] Define and export `AnswerDifficulty` enum (matching backend).
    - [ ] Define and export `PracticeSession` interface (matching backend).
    - [ ] Define and export `ProgressStats` interface (matching backend).
- [ ] **Step 16: API Service Implementation (Prompt 16)**
    - [ ] Edit `frontend/src/services/api.ts`.
    - [ ] Import `axios` and types.
    - [ ] Define `API_BASE_URL`.
    - [ ] Create `apiClient` Axios instance.
    - [ ] Implement and export `fetchPracticeCards` async function.
    - [ ] Implement and export `submitAnswer` async function.
    - [ ] Implement and export `fetchHint` async function.
    - [ ] Implement and export `fetchProgress` async function.
    - [ ] Implement and export `advanceDay` async function.
    - [ ] Ensure correct data extraction and error handling strategy (catch in component or log here).

## Phase 4: Frontend Component Implementation

- [ ] **Step 17: `FlashcardDisplay` - Basic Structure (Prompt 17)**
    - [ ] Edit `frontend/src/components/FlashcardDisplay.tsx`.
    - [ ] Import `React`, `FlashcardData`.
    - [ ] Define `FlashcardDisplayProps`.
    - [ ] Create component structure accepting props.
    - [ ] Render `card.front`.
    - [ ] Conditionally render `card.back` or placeholder based on `showBack`.
    - [ ] Export component.
- [ ] **Step 18: `FlashcardDisplay` - Hint Feature (Prompt 18)**
    - [ ] Edit `frontend/src/components/FlashcardDisplay.tsx`.
    - [ ] Import `useState`, `fetchHint`.
    - [ ] Add state for `hint`, `loadingHint`, `hintError`.
    - [ ] Implement `handleGetHint` async function (call `fetchHint`, manage state).
    - [ ] Conditionally render "Get Hint" button (`!showBack`, connect `onClick`, handle disabled state).
    - [ ] Render hint text/error message based on state.
- [ ] **Step 19: `PracticeView` - State & Initial Load (Prompt 19)**
    - [ ] Edit `frontend/src/components/PracticeView.tsx`.
    - [ ] Import `React`, hooks, types, services, `FlashcardDisplay`.
    - [ ] Initialize component state (`practiceCards`, `currentCardIndex`, `showBack`, `isLoading`, `error`, `day`, `sessionFinished`).
    - [ ] Implement `loadPracticeCards` async function (call `fetchPracticeCards`, update state, handle errors/empty, reset session state).
    - [ ] Call `loadPracticeCards` on mount using `useEffect`.
    - [ ] Implement basic conditional rendering (Loading / Error / Active Card Display / Session Finished).
    - [ ] Export component.
- [ ] **Step 20: `PracticeView` - Answer Logic (Prompt 20)**
    - [ ] Edit `frontend/src/components/PracticeView.tsx`.
    - [ ] Import `submitAnswer`, `AnswerDifficulty`.
    - [ ] Implement `handleShowBack` function.
    - [ ] Implement `handleAnswer` async function (call `submitAnswer`, update index/finished, reset `showBack`, handle errors).
    - [ ] Add "Show Answer" button rendering (`!showBack`, connect `onClick`).
    - [ ] Add Difficulty buttons rendering (`showBack`, connect `onClick` with correct enum values).
- [ ] **Step 21: `PracticeView` - Next Day & Polish (Prompt 21)**
    - [ ] Edit `frontend/src/components/PracticeView.tsx`.
    - [ ] Import `advanceDay`.
    - [ ] Implement `handleNextDay` async function (call `advanceDay`, then `loadPracticeCards`, handle errors).
    - [ ] Add "Go to Next Day" button rendering (`sessionFinished`, connect `onClick`).
    - [ ] Add Day/Card Count display in active view.
    - [ ] Ensure buttons are disabled during relevant loading/submitting states.
- [ ] **Step 22: App Structure (`App.tsx`, `main.tsx`) (Prompt 22)**
    - [ ] Edit `frontend/src/App.tsx`.
    - [ ] Import `React`, `PracticeView`.
    - [ ] Render title and `<PracticeView />`.
    - [ ] Verify `frontend/src/main.tsx` setup is standard for Vite React TS.

## Phase 5: Integration & Manual Testing

- [ ] **Step 23: Run Both Servers**
    - [ ] Start backend: `cd backend && npm run dev`.
    - [ ] Start frontend: `cd frontend && npm run dev`.
- [ ] **Step 24: Manual Test Execution**
    - [ ] Verify initial card load.
    - [ ] Test "Show Answer" -> Difficulty submission flow.
    - [ ] Check backend logs for correct processing.
    - [ ] Test "Get Hint".
    - [ ] Test completing a session.
    - [ ] Test "Go to Next Day".
    - [ ] Test basic error handling visibility (if possible).
    - [ ] Manually call `GET /api/progress` (e.g., using browser dev tools or `curl`) to verify output format.
