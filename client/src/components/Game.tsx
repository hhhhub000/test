import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameState, GamePiece, BoardCell, HandPiece, Player } from "@shared/schema";
import GameBoard from "./GameBoard";
import HandArea from "./HandArea";
import GameInfo from "./GameInfo";
// Browser-compatible UUID generation
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const BOARD_SIZE = 8;

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  function createInitialGameState(): GameState {
    // Create empty 8x8 board
    const board: BoardCell[][] = Array(BOARD_SIZE).fill(null).map(() =>
      Array(BOARD_SIZE).fill(null).map(() => ({ piece: null }))
    );

    // Generate random pieces for each player
    const generatePieces = (player: Player): HandPiece[] => {
      return Array(12).fill(null).map(() => ({
        id: generateUUID(),
        player,
        activationTurns: Math.floor(Math.random() * 5) + 1, // 1-5 turns
        expirationTurns: Math.floor(Math.random() * 5) + 1, // 1-5 turns
      }));
    };

    return {
      board,
      currentPlayer: 1,
      turnCount: 1,
      playerHands: {
        1: generatePieces(1),
        2: generatePieces(2),
      },
      winner: null,
      gameOver: false,
    };
  }

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.gameOver || !selectedPieceId) return;
    
    // Check if cell is empty
    if (gameState.board[row][col].piece !== null) return;

    const selectedPiece = gameState.playerHands[gameState.currentPlayer].find(
      p => p.id === selectedPieceId
    );
    
    if (!selectedPiece) return;

    // Place piece on board
    const newPiece: GamePiece = {
      ...selectedPiece,
      isActive: selectedPiece.activationTurns === 0,
      turnsRemaining: selectedPiece.activationTurns,
    };

    setGameState(prev => {
      const newBoard = prev.board.map(boardRow => boardRow.map(cell => ({ ...cell })));
      newBoard[row][col] = { piece: newPiece };

      const newHands = {
        ...prev.playerHands,
        [prev.currentPlayer]: prev.playerHands[prev.currentPlayer].filter(
          p => p.id !== selectedPieceId
        ),
      };

      const newState = {
        ...prev,
        board: newBoard,
        playerHands: newHands,
        currentPlayer: (prev.currentPlayer === 1 ? 2 : 1) as Player,
        turnCount: prev.turnCount + 1,
      };

      return updateTimersAndCheckWin(newState);
    });

    setSelectedPieceId(null);
  }, [gameState.gameOver, selectedPieceId, gameState]);

  const updateTimersAndCheckWin = (state: GameState): GameState => {
    // Update piece timers
    const newBoard = state.board.map(row =>
      row.map(cell => {
        if (!cell.piece) return cell;
        
        const piece = { ...cell.piece };
        
        if (!piece.isActive) {
          // Count down activation timer
          piece.turnsRemaining = Math.max(0, piece.turnsRemaining - 1);
          if (piece.turnsRemaining === 0) {
            piece.isActive = true;
            piece.turnsRemaining = piece.expirationTurns;
          }
        } else {
          // Count down expiration timer
          piece.turnsRemaining = Math.max(0, piece.turnsRemaining - 1);
          if (piece.turnsRemaining === 0) {
            // Piece expires
            return { piece: null };
          }
        }
        
        return { piece };
      })
    );

    const newState = { ...state, board: newBoard };
    
    // Check for winner
    const winner = checkWinner(newBoard);
    if (winner) {
      newState.winner = winner;
      newState.gameOver = true;
    }

    return newState;
  };

  const checkWinner = (board: BoardCell[][]): Player | null => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1] // horizontal, vertical, diagonal
    ];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col].piece;
        if (!piece || !piece.isActive) continue;

        for (const [dr, dc] of directions) {
          let count = 1;
          
          // Check in positive direction
          let r = row + dr, c = col + dc;
          while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            const nextPiece = board[r][c].piece;
            if (nextPiece && nextPiece.isActive && nextPiece.player === piece.player) {
              count++;
              r += dr;
              c += dc;
            } else {
              break;
            }
          }
          
          // Check in negative direction
          r = row - dr;
          c = col - dc;
          while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            const nextPiece = board[r][c].piece;
            if (nextPiece && nextPiece.isActive && nextPiece.player === piece.player) {
              count++;
              r -= dr;
              c -= dc;
            } else {
              break;
            }
          }
          
          if (count >= 4) {
            return piece.player;
          }
        }
      }
    }
    
    return null;
  };

  const handleReset = () => {
    setGameState(createInitialGameState());
    setSelectedPieceId(null);
  };

  const handlePieceSelect = (pieceId: string) => {
    setSelectedPieceId(selectedPieceId === pieceId ? null : pieceId);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">
          Strategic 4-in-a-Row
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player 1 Hand */}
          <div className="lg:order-1">
            <HandArea
              player={1}
              pieces={gameState.playerHands[1]}
              selectedPieceId={gameState.currentPlayer === 1 ? selectedPieceId : null}
              onPieceSelect={handlePieceSelect}
              isCurrentPlayer={gameState.currentPlayer === 1}
            />
          </div>

          {/* Game Board */}
          <div className="lg:order-2 flex justify-center">
            <GameBoard
              board={gameState.board}
              onCellClick={handleCellClick}
            />
          </div>

          {/* Player 2 Hand and Game Info */}
          <div className="lg:order-3 space-y-4">
            <HandArea
              player={2}
              pieces={gameState.playerHands[2]}
              selectedPieceId={gameState.currentPlayer === 2 ? selectedPieceId : null}
              onPieceSelect={handlePieceSelect}
              isCurrentPlayer={gameState.currentPlayer === 2}
            />
            
            <GameInfo
              currentPlayer={gameState.currentPlayer}
              turnCount={gameState.turnCount}
              winner={gameState.winner}
              gameOver={gameState.gameOver}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </div>
  );
}