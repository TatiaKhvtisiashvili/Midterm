import axios from "axios";
import {PracticeSession,UpdateRequest,ProgressStats, AnswerDifficulty, Flashcard} from "../types"



const API_BASE_URL = 'http://localhost:3001/api';


const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });


  export async function fetchPracticeCards(): Promise<PracticeSession> {
    try{
    const response = await apiClient.get("/practice");
    return response.data;
    }
    catch(error) {
        console.error("Error fetching practice cards:", error);
        throw error;
      }
  }

  // Submit user answer and update card's bucket
export async function submitAnswer(
    cardFront: string,
    cardBack: string,
    difficulty: AnswerDifficulty
  ): Promise<void> {
    try{
    const payload: UpdateRequest = { cardFront, cardBack, difficulty };
    await apiClient.post("/update", payload);
}  catch(error) {
    console.error("Error submitting answer:", error);
    throw error;
  }
}

// Fetch a hint for a given card
export async function fetchHint(card: Flashcard): Promise<string> {
    try{
        const response = await apiClient.get("/hint", {
            params: {
              cardFront: card.front,
              cardBack: card.back,
            },
          });
          return response.data.hint;
    }
   catch(error){
        console.error("Error fetching hint:", error);
        throw error;
      }
   }
  

   // Get overall progress statistics
export async function fetchProgress(): Promise<ProgressStats> {
    try{
        const response = await apiClient.get("/progress");
        return response.data;
    }
    catch(error){
        console.error("Error fetching progress:", error);
        throw error;
    }
  }

  // Advance to the next day
export async function advanceDay(): Promise<{ message: string,  currentDay: number }> {
    try{
        const response = await apiClient.post("/day/next");
        return response.data;
    }
    catch(error){
        console.error("Error advancing day:", error);
        throw error;
    }
  }