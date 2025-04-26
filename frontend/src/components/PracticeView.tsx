// frontend/src/components/PracticeView.tsx
import React, { useState, useEffect } from 'react';
import { Flashcard, AnswerDifficulty } from '../types';
import { fetchPracticeCards, submitAnswer, advanceDay } from '../services/api';
import FlashcardDisplay from './FlashcardDisplay';

const PracticeView: React.FC = () => {
  const [practiceCards, setPracticeCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);

  const loadPracticeCards = async () => {
    setIsLoading(true);
    setError(null);
    setSessionFinished(false);
    
    try {
      const session = await fetchPracticeCards();
      
      // Convert bucket map to flat array of flashcards
      const flashcards = Array.from(session.bucketMap.values())
        .flatMap(set => Array.from(set));
      setPracticeCards(flashcards);
      
      // Get current day from advanceDay API since it's not in PracticeSession
      const dayResponse = await advanceDay();
      setDay(dayResponse.currentDay);
      
      if (session.isComplete || flashcards.length === 0) {
        setSessionFinished(true);
      }
    } catch (err) {
      setError('Failed to load practice cards. Please try again.');
      console.error('Error loading cards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPracticeCards();
  }, []);

  const handleShowBack = () => {
    setShowBack(true);
  };

  const handleAnswer = async (difficulty: AnswerDifficulty) => {
    if (currentCardIndex >= practiceCards.length) return;

    const currentCard = practiceCards[currentCardIndex];
    
    try {
      await submitAnswer(
        currentCard,
        difficulty,
        day // Using day as currentBucket since we don't have bucket info
      );
      
      if (currentCardIndex < practiceCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowBack(false);
      } else {
        setSessionFinished(true);
      }
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      console.error('Error submitting answer:', err);
    }
  };

  const handleNextDay = async () => {
    try {
      const dayResponse = await advanceDay();
      setDay(dayResponse.currentDay);
      await loadPracticeCards();
      setCurrentCardIndex(0);
      setShowBack(false);
    } catch (err) {
      setError('Failed to advance to next day. Please try again.');
      console.error('Error advancing day:', err);
    }
  };

  if (isLoading) {
    return <div style={styles.loading}>Loading practice session...</div>;
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>{error}</p>
        <button onClick={loadPracticeCards} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (sessionFinished) {
    return (
      <div style={styles.sessionComplete}>
        <h2>Session Complete!</h2>
        <p>You've reviewed all cards for today.</p>
        <button onClick={handleNextDay} style={styles.nextDayButton}>
          Go to Next Day
        </button>
      </div>
    );
  }

  const currentCard = practiceCards[currentCardIndex];
  const cardCount = `${currentCardIndex + 1} of ${practiceCards.length}`;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Day {day}</h2>
        <span style={styles.cardCount}>{cardCount}</span>
      </div>

      <FlashcardDisplay card={currentCard} showBack={showBack} />

      <div style={styles.controls}>
        {!showBack ? (
          <button onClick={handleShowBack} style={styles.showAnswerButton}>
            Show Answer
          </button>
        ) : (
          <div style={styles.answerButtons}>
            <button 
              onClick={() => handleAnswer(AnswerDifficulty.Wrong)}
              style={{ ...styles.difficultyButton, backgroundColor: '#f44336' }}
            >
              Wrong
            </button>
            <button 
              onClick={() => handleAnswer(AnswerDifficulty.Hard)}
              style={{ ...styles.difficultyButton, backgroundColor: '#ff9800' }}
            >
              Hard
            </button>
            <button 
              onClick={() => handleAnswer(AnswerDifficulty.Easy)}
              style={{ ...styles.difficultyButton, backgroundColor: '#4caf50' }}
            >
              Easy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Styling
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCount: {
    fontSize: '1.2rem',
    color: '#666',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  showAnswerButton: {
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  answerButtons: {
    display: 'flex',
    gap: '10px',
  },
  difficultyButton: {
    padding: '12px 24px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    minWidth: '80px',
  },
  loading: {
    textAlign: 'center' as const,
    fontSize: '1.2rem',
    marginTop: '50px',
  },
  error: {
    textAlign: 'center' as const,
    color: '#d32f2f',
    marginTop: '50px',
  },
  retryButton: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  sessionComplete: {
    textAlign: 'center' as const,
    marginTop: '50px',
  },
  nextDayButton: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default PracticeView;