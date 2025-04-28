# Implementation Todo List: Flashcard Application Enhancements

## Initial Setup

- [ ] Fork and clone the repository
- [ ] Install dependencies and verify basic functionality
- [ ] Create feature branches for each enhancement
- [ ] Set up testing framework and basic structure

## Feature 1: File-Based State Persistence

### Data Serialization Module

- [ ] Create new module `src/persistence/serializer.ts`
- [ ] Define interfaces for serialized state
- [ ] Write function to transform `Map<number, Set<Flashcard>>` to serializable object
- [ ] Write function to transform serializable object back to Maps and Sets
- [ ] Handle edge cases (empty Maps/Sets, circular references)
- [ ] Add unit tests for serialization functions

### File Operations

- [ ] Create module `src/persistence/fileOperations.ts`
- [ ] Implement `saveState(data: SerializedState): Promise<void>` function
- [ ] Implement `loadState(): Promise<SerializedState | null>` function
- [ ] Add appropriate error handling for file operations
- [ ] Create backup mechanism before overwriting existing files
- [ ] Add logging for persistence operations
- [ ] Write unit tests with mock filesystem

### Server Integration

- [ ] Create `src/persistence/stateManager.ts` to coordinate persistence
- [ ] Implement state initialization during server startup
- [ ] Add signal handlers for graceful shutdown (SIGINT, SIGTERM)
- [ ] Create shutdown sequence with state saving
- [ ] Handle race conditions during multiple signals
- [ ] Test complete persistence cycle (start → modify → shutdown → restart)

## Feature 2: Browser Extension

### Extension Scaffolding

- [ ] Create extension directory structure
- [ ] Write manifest.json with required permissions
- [ ] Add icons and assets
- [ ] Create background script with context menu registration
- [ ] Set up message passing between components
- [ ] Test basic extension loading

### API Client

- [ ] Create API module in extension
- [ ] Implement fetch wrapper with error handling
- [ ] Add functions for preparing cards (`/api/cards/prepare`)
- [ ] Add functions for saving cards (`/api/cards`)
- [ ] Test API connectivity and error scenarios

### Backend Endpoints

- [ ] Create `src/services/llmService.ts` for LLM integration
- [ ] Set up API key handling and configuration
- [ ] Implement card question generation logic
- [ ] Add duplicate detection helper in state module
- [ ] Create `/api/cards/prepare` endpoint
- [ ] Update `/api/cards` endpoint to handle tags and hints
- [ ] Add comprehensive tests for both endpoints

### Extension UI

- [ ] Design popup UI for card review
- [ ] Create loading indicator component
- [ ] Build card edit form with validation
- [ ] Implement tag input with auto-complete
- [ ] Add success/error notification system
- [ ] Create context menu action handler
- [ ] Implement text selection capture
- [ ] Test full extension workflow across browsers

## Feature 3: Gesture Recognition

### Webcam Integration

- [ ] Update frontend to include video element (hidden by default)
- [ ] Implement webcam permission request
- [ ] Create error handler for denied permissions
- [ ] Add webcam feed display component
- [ ] Implement activation toggle
- [ ] Test webcam functionality across browsers

### TensorFlow.js Integration

- [ ] Add TensorFlow.js dependencies
- [ ] Create module for hand pose detection
- [ ] Implement model loading and initialization
- [ ] Add performance optimizations (resolution, frame rate)
- [ ] Create debug visualization for hand tracking
- [ ] Test model on various devices and browsers

### Gesture Recognition Logic

- [ ] Define landmark patterns for three key gestures
- [ ] Create gesture detection algorithm
- [ ] Implement confidence scoring system
- [ ] Add gesture stability tracking (3-second hold)
- [ ] Create visual feedback for detected gestures
- [ ] Implement gesture-to-difficulty mapping
- [ ] Add reset logic for lost/changed gestures
- [ ] Test recognition with different users and conditions

### Practice Session Integration

- [ ] Update practice UI with webcam and gesture components
- [ ] Add "Ready for Gesture" button
- [ ] Create processing indicator
- [ ] Implement gesture session state machine
- [ ] Connect gesture results to answer submission
- [ ] Maintain compatibility with button controls
- [ ] Ensure smooth transitions between cards
- [ ] Test full practice session with gesture input

## Testing & Quality Assurance

- [ ] Write unit tests for serialization module
- [ ] Create tests for LLM integration
- [ ] Test browser extension with mocked backends
- [ ] Perform manual testing of gesture recognition
- [ ] Conduct cross-browser compatibility testing
- [ ] Address accessibility considerations
- [ ] Document known limitations

## Documentation

- [ ] Update README with new features
- [ ] Create installation guide for browser extension
- [ ] Document webcam requirements and troubleshooting
- [ ] Add developer guide for extending the system
- [ ] Create demo video showcasing all features
- [ ] Update API documentation