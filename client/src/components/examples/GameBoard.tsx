import GameBoard from '../GameBoard';
import { BoardCell, GamePiece } from '@shared/schema';

export default function GameBoardExample() {
  // Create a sample 8x8 board with some pieces
  const createBoard = (): BoardCell[][] => {
    const board: BoardCell[][] = Array(8).fill(null).map(() => 
      Array(8).fill(null).map(() => ({ piece: null }))
    );
    
    // Add some sample pieces
    board[3][2] = {
      piece: {
        id: '1',
        player: 1,
        activationTurns: 0,
        expirationTurns: 3,
        isActive: true,
        turnsRemaining: 3
      }
    };
    
    board[3][3] = {
      piece: {
        id: '2',
        player: 2,
        activationTurns: 2,
        expirationTurns: 4,
        isActive: false,
        turnsRemaining: 0
      }
    };
    
    board[4][3] = {
      piece: {
        id: '3',
        player: 1,
        activationTurns: 0,
        expirationTurns: 1,
        isActive: true,
        turnsRemaining: 1
      }
    };
    
    return board;
  };

  const handleCellClick = (row: number, col: number) => {
    console.log(`Cell clicked: ${row}, ${col}`);
  };

  return (
    <div className="p-4">
      <GameBoard 
        board={createBoard()} 
        onCellClick={handleCellClick}
        highlightedCells={[{ row: 3, col: 2 }, { row: 4, col: 3 }]}
      />
    </div>
  );
}