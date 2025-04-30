import { useState, useEffect } from "react";
import { Flashcard, AnswerDifficulty } from "../types";
import { fetchPracticeCards, submitAnswer, advanceDay } from "../services/api";
import FlashcardDisplay from "./FlashcardDisplay";
import Camera from "./camera/camera";

const PracticeView = () => {
    const [practiceCards, setPracticeCards] = useState<Flashcard[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
    const [showBack, setShowBack] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [day, setDay] = useState<number>(0);
    const [sessionFinished, setSessionFinished] = useState<boolean>(false);
    const [showAnswerButton, setShowAnswerButton] = useState<boolean>(true);
    const [showDifficultyButtons, setShowDifficultyButtons] = useState<boolean>(false);
    const [processingGesture, setProcessingGesture] = useState(false);
    const [forceCameraReset, setForceCameraReset] = useState(0);

    useEffect(() => {
        loadPracticeCards();
    }, [day]);

    useEffect(() => {
      setShowAnswerButton(true);
      setShowDifficultyButtons(false);
      setShowBack(false);
      setShowHint(true); // Add this line to show hint for new card
  }, [currentCardIndex]);
  

    async function loadPracticeCards() {
        try {
            setIsLoading(true);
            setError(null);
            setSessionFinished(false);
            setShowAnswerButton(true);
            setShowDifficultyButtons(false);

            const response = await fetchPracticeCards();
            setPracticeCards(response.cards);
            setDay(response.day + 1);
            if (response.cards.length === 0) {
                setSessionFinished(true);
            }
        } catch (error) {
            setError("Error fetching practice cards. Please try again.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }
    const [showHint, setShowHint] = useState<boolean>(true);

    const handleShowBack = () => {
    setShowBack(true);
    setShowAnswerButton(false);
    setShowDifficultyButtons(true);
    setShowHint(false);
    // Force camera reset
    setForceCameraReset(prev => prev + 1);
};

    const handleAnswer = async (difficulty: AnswerDifficulty) => {
        if (processingGesture) return;
        
        setProcessingGesture(true);
        const currentCard = practiceCards[currentCardIndex];

        try {
            await submitAnswer(currentCard.front, currentCard.back, difficulty);

            if (currentCardIndex < practiceCards.length - 1) {
                setCurrentCardIndex(currentCardIndex + 1);
            } else {
                setSessionFinished(true);
            }

            setShowBack(false);
            setShowDifficultyButtons(false);
        } catch (error) {
            setError("Error submitting answer. Please try again.");
            console.error(error);
        } finally {
            setProcessingGesture(false);
        }
    };

    async function handleNextDay() {
        try {
            await advanceDay();
            await loadPracticeCards();
            setCurrentCardIndex(0);
        } catch (error) {
            setError("Error advancing to the next day. Please try again.");
            throw error;
        }
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="practice-container">
           <Camera 
    key={`camera-${forceCameraReset}`}
    onGestureDetected={handleAnswer}
    shouldProcessGestures={showDifficultyButtons}
/>
            <p className="day">day: {day}</p>

            {sessionFinished ? (
                <div>
                    <p className="session">Session Complete</p>
                    <button className="nextday" onClick={handleNextDay}>Go to Next Day</button>
                </div>
            ) : (
              <FlashcardDisplay 
              card={practiceCards[currentCardIndex]} 
              showBack={showBack}
              showHint={showHint} 
           />
            )}

            {showAnswerButton && !showBack && !sessionFinished && (
                <button className="showanswer" onClick={handleShowBack}>Show Answer</button>
            )}

            {showDifficultyButtons && !sessionFinished && (
                <div className="difficulty-buttons-container">
                    <p className="difficulty-prompt">How difficult was this card?</p>
                    <p>Use hand gestures to answer:</p>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                          <li>👍 Thumbs up if Easy</li>
                          <li>👎 Thumbs down if Wrong</li>
                          <li>✋ Flat hand if Hard</li>
                    </ul>
                    <div>
                        <button className="wrong" onClick={() => handleAnswer(0)}>Wrong</button>
                        <button className="hard" onClick={() => handleAnswer(1)}>Hard</button>
                        <button className="easy" onClick={() => handleAnswer(2)}>Easy</button>
                    </div>
                </div>
            )}

            <p className="cardnum">card number:{currentCardIndex + 1} of {practiceCards.length}</p>
        </div>
    );
};

export default PracticeView;