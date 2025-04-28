# Specification: Flashcard Application Enhancement Project


## 1. Project Overview

This document outlines the enhancement plan for extending our existing flashcard learning application with three key features: file-based persistence, a browser extension for rapid card creation, and gesture recognition for practice sessions. These features will significantly improve usability and provide a more seamless learning experience.

## 2. Feature Descriptions

### 2.1 File-Based Persistence System

**Purpose:** To maintain application state across server restarts, ensuring users never lose their learning progress or created flashcards.

**Requirements:**
- Create a serialization system to convert in-memory state (Maps/Sets) to JSON-compatible formats
- Implement read/write operations for a state file (`flashcards-data.json`)
- Add graceful shutdown listeners to save state before exiting
- Implement state loading during server initialization
- Handle various error conditions (corrupted files, permission issues)

**Technical Approach:**
- Use Node.js fs/promises API for async file operations
- Implement custom serialization logic for complex data structures
- Add signal handlers for SIGINT and SIGTERM
- Create robust error handling with fallback to initial state

### 2.2 Smart Card Creation Browser Extension

**Purpose:** To empower users to create flashcards directly from content they're studying online, with AI assistance for generating effective questions.

**Requirements:**
- Create a cross-browser compatible extension (Chrome/Firefox/Edge)
- Implement text selection capture mechanism
- Create backend API endpoint for AI-powered question generation
- Build card review interface within the extension popup
- Support tagging and hint addition
- Implement duplicate detection to prevent redundant cards

**Technical Approach:**
- Use WebExtensions API with Manifest V3
- Create context menu integration for right-click access
- Implement backend LLM integration with appropriate prompt engineering
- Create a clean, intuitive card editing interface
- Add proper error handling and offline support

### 2.3 Gesture-Based Answer Interface

**Purpose:** To provide a more intuitive and engaging way to interact with flashcards during practice sessions.

**Requirements:**
- Implement webcam access with appropriate permission handling
- Integrate TensorFlow.js for hand pose detection
- Define and recognize three specific gestures for answer difficulties
- Create a visual feedback system for gesture recognition
- Implement a gesture confirmation mechanism (3-second hold)
- Maintain traditional UI controls as fallback

**Technical Approach:**
- Use MediaDevices API for webcam access
- Implement TensorFlow.js Hand Pose Detection model
- Create custom gesture recognition logic
- Design intuitive visual feedback system
- Implement smooth state transitions between card reviews

## 3. Data Structures and Interfaces

### 3.1 Enhanced Flashcard Model

```typescript
interface Flashcard {
  front: string;          // Question/prompt
  back: string;           // Answer/content
  hint?: string;          // Optional hint text
  tags?: string[];        // Optional categorization tags
  createdAt: number;      // Timestamp
  lastPracticed?: number; // Timestamp of last review
}
```

### 3.2 New API Endpoints

```
POST /api/cards/prepare
  Request: { backText: string }
  Response: { front: string, back: string } | { status: "duplicate" } | { status: "error", message: string }

POST /api/cards
  Request: { front: string, back: string, hint?: string, tags?: string[] }
  Response: { status: "success", cardId: string } | { status: "error", message: string }
```

## 4. User Experience Workflows

### 4.1 Browser Extension Workflow

1. User highlights text on a webpage
2. User clicks extension icon or right-clicks to access context menu
3. Extension shows loading indicator and sends text to backend
4. Backend checks for duplicates and generates a question using LLM
5. Extension shows form with generated question and original text
6. User can edit question/answer and add optional tags and hint
7. User clicks "Save Card" to add to learning system
8. Extension confirms success or shows appropriate error

### 4.2 Gesture Recognition Workflow

1. User starts practice session
2. System requests webcam access if not already granted
3. User reveals card answer by clicking on card
4. User clicks "Ready for Gesture" button
5. User performs gesture corresponding to answer difficulty:
   - Thumbs Down = Wrong (reset to bucket 0)
   - Flat Hand = Hard (move back one bucket)
   - Thumbs Up = Easy (move forward one bucket)
6. System provides visual feedback during gesture recognition
7. After holding gesture for 3 seconds, answer is recorded
8. System advances to next card
9. User can use traditional button controls if preferred

## 5. Implementation Guidelines

- Use TypeScript for type safety and code maintainability
- Follow modular architecture with clear separation of concerns
- Implement comprehensive error handling at all levels
- Add appropriate logging for debugging and monitoring
- Write unit tests for critical system components
- Consider performance optimizations for gesture recognition

## 6. Success Criteria

- State successfully persists across server restarts (100% reliability)
- Browser extension works on Chrome, Firefox, and Edge
- LLM generates relevant questions for highlighted text (>80% quality)
- Gesture recognition accuracy exceeds 90% under good lighting conditions
- System handles all edge cases and error conditions gracefully
- Performance remains smooth during gesture recognition (< 100ms latency)