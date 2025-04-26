// frontend/src/components/FlashcardDisplay.tsx
import React, { useState } from 'react';
import { Flashcard } from '../types';
import { fetchHint } from '../services/api';

interface Props {
  card: Flashcard;
  showBack: boolean;
}

const FlashcardDisplay: React.FC<Props> = ({ card, showBack }) => {
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  const handleGetHint = async () => {
    setLoadingHint(true);
    setHintError(null);
    try {
      const hint = await fetchHint(card);
      setHint(hint);
    } catch (error) {
      setHintError('Failed to fetch hint. Please try again.');
      console.error('Error fetching hint:', error);
    } finally {
      setLoadingHint(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.front}>
          <h3 style={styles.text}>{card.front}</h3>
        </div>
        <div style={styles.back}>
          <h3 style={styles.text}>
            {showBack ? card.back : '???'}
          </h3>
        </div>
      </div>

      {!showBack && (
        <div style={styles.hintSection}>
          <button
            onClick={handleGetHint}
            disabled={loadingHint}
            style={styles.hintButton}
          >
            {loadingHint ? 'Loading...' : 'Get Hint'}
          </button>
          {hint && <p style={styles.hintText}>Hint: {hint}</p>}
          {hintError && <p style={styles.errorText}>{hintError}</p>}
        </div>
      )}
    </div>
  );
};

// Basic styling (can be moved to a separate CSS file)
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  card: {
    width: '100%',
    minHeight: '200px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },
  front: {
    marginBottom: '15px',
  },
  back: {
    marginTop: '15px',
    borderTop: '1px solid #ddd',
    paddingTop: '15px',
  },
  text: {
    margin: 0,
    textAlign: 'center' as const,
    color: '#333',
  },
  hintSection: {
    width: '100%',
    textAlign: 'center' as const,
  },
  hintButton: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '10px',
  },
  hintText: {
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#d32f2f',
  },
};

export default FlashcardDisplay;