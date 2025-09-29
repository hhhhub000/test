import { useState } from 'react';
import GameInfo from '../GameInfo';
import { Player } from '@shared/schema';

export default function GameInfoExample() {
  const [gameState, setGameState] = useState({
    currentPlayer: 1 as Player,
    turnCount: 15,
    winner: null as Player | null,
    gameOver: false
  });

  const handleReset = () => {
    setGameState({
      currentPlayer: 1,
      turnCount: 1,
      winner: null,
      gameOver: false
    });
    console.log('Game reset triggered');
  };

  const simulateGameEnd = () => {
    setGameState(prev => ({
      ...prev,
      winner: 1,
      gameOver: true
    }));
  };

  return (
    <div className="p-4 space-y-4">
      <GameInfo
        currentPlayer={gameState.currentPlayer}
        turnCount={gameState.turnCount}
        winner={gameState.winner}
        gameOver={gameState.gameOver}
        onReset={handleReset}
      />
      
      <div className="flex gap-2">
        <button 
          onClick={simulateGameEnd}
          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
        >
          Simulate Win
        </button>
        <button 
          onClick={() => setGameState(prev => ({ ...prev, currentPlayer: prev.currentPlayer === 1 ? 2 : 1 }))}
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm"
        >
          Switch Player
        </button>
      </div>
    </div>
  );
}