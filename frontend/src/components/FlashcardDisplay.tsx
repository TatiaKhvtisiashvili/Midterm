import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { Flashcard } from "../types";
import { fetchHint } from "../services/api";
import "./FlashcardDisplay.css";

interface FlashcardDisplayProps {
  card: Flashcard;
  showBack: boolean;
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  card,
  showBack,
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
    
    <h1 className="flashcard">
    {showBack ? card.back : card.front}
    </h1>

    <h2>
  
    </h2>

  { !showBack && <button className="get_hint" ref={hintButton} onClick={handleGetHint}>Get Hint</button> }
  <h3>{ hintError === "" ?  hint : hintError}</h3>

  
  
  </div>;
};

export default FlashcardDisplay;
