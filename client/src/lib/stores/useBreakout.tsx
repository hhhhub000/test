import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "ready" | "playing" | "gameOver" | "won";

interface BreakoutState {
  gameState: GameState;
  score: number;
  lives: number;
  
  // Actions
  startGame: () => void;
  endGame: () => void;
  winGame: () => void;
  resetGame: () => void;
  updateScore: (points: number) => void;
  loseLife: () => void;
}

export const useBreakout = create<BreakoutState>()(
  subscribeWithSelector((set, get) => ({
    gameState: "ready",
    score: 0,
    lives: 3,
    
    startGame: () => {
      console.log("Starting breakout game");
      set(() => ({
        gameState: "playing",
        score: 0,
        lives: 3
      }));
    },
    
    endGame: () => {
      console.log("Game over");
      set(() => ({
        gameState: "gameOver"
      }));
    },
    
    winGame: () => {
      console.log("Player won!");
      set(() => ({
        gameState: "won"
      }));
    },
    
    resetGame: () => {
      console.log("Resetting game");
      set(() => ({
        gameState: "ready",
        score: 0,
        lives: 3
      }));
    },
    
    updateScore: (points: number) => {
      set((state) => ({
        score: state.score + points
      }));
    },
    
    loseLife: () => {
      set((state) => ({
        lives: state.lives - 1
      }));
    }
  }))
);
