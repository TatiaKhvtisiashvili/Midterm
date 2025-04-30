import { useState } from "react";
import { useEffect } from "react";
import { Flashcard, AnswerDifficulty } from "../types";
import { fetchPracticeCards, submitAnswer, advanceDay } from "../services/api";
import FlashcardDisplay from "./FlashcardDisplay";





// Sets loading state, clears errors/sessionFinished.
// Calls fetchPracticeCards.
// Updates practiceCards, day state.
// Sets sessionFinished if no cards are returned.
// Handles errors, updates error state.
// Clears loading state.

const PracticeView = () => {

    const [practiceCards, setPracticeCards] = useState<Flashcard[]>([]);
const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
const [showBack, setShowBack] = useState<boolean>(false);
const [isLoading, setIsLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
const [day, setDay] = useState<number>(0);
const [sessionFinished, setSessionFinished] = useState<boolean>(false);

    useEffect(() => {
        loadPracticeCards();
    },[day])

async function loadPracticeCards() {
    try {
      setIsLoading(true);
      setError(null);
      setSessionFinished(false);
  
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
  
  
  function handleShowBack(){
      setShowBack(true);
  }
  
  async function handleAnswer(difficulty: AnswerDifficulty) {
      const currentCard = practiceCards[currentCardIndex];
    
      try {
        await submitAnswer(currentCard.front, currentCard.back, difficulty);
    
        if (currentCardIndex < practiceCards.length - 1) {
          setCurrentCardIndex(currentCardIndex + 1);
        } else {
          setSessionFinished(true);
        }
    
        setShowBack(false);
      } catch (error) {
        setError("Error submitting answer. Please try again.");
        throw error;
      }
    }
  
    async function handleNextDay() {
      try {
        await advanceDay();             // Move to the next day
        await loadPracticeCards();      // Fetch cards for the new day
        setCurrentCardIndex(0);
      } catch (error) {
        setError("Error advancing to the next day. Please try again.");
        throw error;
      }
    }

  

    if(isLoading){
        return <div>Loading...</div>;
    }
    if(error){
        return <div>{error}</div>;
    }
    
  return (
    <div>

   { sessionFinished ? <div>  <h1>Session Complete</h1>
    <button onClick={handleNextDay}>Go to Next Day</button>
    </div> : 
    <FlashcardDisplay card={practiceCards[currentCardIndex]} showBack={showBack} /> }
    <button onClick={handleShowBack}>Show Answer</button>

    <div>
        <button onClick={() => handleAnswer(0) }>wrong</button>
        <button onClick={() => handleAnswer(2) }>easy</button>
        <button onClick={() => handleAnswer(1)} >hard</button>
    </div>

    <h1>day: {day}</h1>
    <h1>card number:{currentCardIndex + 1} of {practiceCards.length}</h1>
    </div>
  );
};

export default PracticeView;
