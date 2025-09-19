import { useBreakout } from '../lib/stores/useBreakout';
import { useAudio } from '../lib/stores/useAudio';
import { Volume2, VolumeX } from 'lucide-react';

export default function GameUI() {
  const { gameState, score, lives, startGame } = useBreakout();
  const { isMuted, toggleMute } = useAudio();

  return (
    <>
      {/* Score and Lives Display */}
      <div className="absolute top-4 left-4 text-white font-bold text-xl bg-black bg-opacity-50 px-4 py-2 rounded">
        Score: {score} | Lives: {lives}
      </div>

      {/* Sound Toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded hover:bg-opacity-70"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* Game State Overlays */}
      {gameState === 'ready' && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">BREAKOUT</h1>
            <p className="text-xl mb-2">Use arrow keys or A/D to move paddle</p>
            <p className="text-lg mb-4">Break all blocks to win!</p>
            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-xl"
            >
              Press SPACE to Start
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4 text-red-500">GAME OVER</h1>
            <p className="text-xl mb-4">Final Score: {score}</p>
            <button
              onClick={startGame}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded text-xl"
            >
              Press SPACE to Restart
            </button>
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4 text-green-500">YOU WIN!</h1>
            <p className="text-xl mb-4">Final Score: {score}</p>
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-xl"
            >
              Press SPACE to Play Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded">
          <p className="text-sm">Arrow Keys or A/D to move paddle</p>
        </div>
      )}
    </>
  );
}
