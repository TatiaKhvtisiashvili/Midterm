import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { Flashcard } from "../types";
import { fetchHint } from "../services/api";
import "./FlashcardDisplay.css";

interface FlashcardDisplayProps {
  card: Flashcard;
  showBack: boolean;
  showHint: boolean; 
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  card,
  showBack,
  showHint, 
}) => {
  const [hint, setHint] = useState<string>("");
  const [loadingHint, setLoadingHint] = useState<boolean>(false);
  const [hintError, setHintError] = useState<string>();
  const hintButton = useRef<HTMLButtonElement | null>(null);


  useEffect(() => {
    setHint("");
  }, [card])

  async function handleGetHint() {
    setLoadingHint(true);
    const hint =  await fetchHint(card);
    if(hint){
        setHint(hint);
        setHintError("");
    } else{
        setHintError("Error fetching hint. Please try again.");
    }
    setLoadingHint(false)  
  } 

// if(loadingHint) {
//     hintButton.current?.setAttribute("disabled", "true");
// }

  return <div>
    
    <p className="flashcard">
    {showBack ? card.back : card.front}
    </p>

    <h2>
  
    </h2>

    { !showBack && showHint && ( 
    <button className="get_hint" ref={hintButton} onClick={handleGetHint}>
    {loadingHint ? "Loading..." : "Get Hint"}
    </button>
  )}  
  { hint && !showBack && showHint && ( 
    <h3>{hint}</h3>
  )}
  { hintError && !showBack && showHint && ( 
    <h3>{hintError}</h3>
  )}

  
  
  </div>;
};

export default FlashcardDisplay;
