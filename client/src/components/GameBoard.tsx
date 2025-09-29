import { cn } from "@/lib/utils";
import { BoardCell } from "@shared/schema";
import GamePiece from "./GamePiece";

interface GameBoardProps {
  board: BoardCell[][];
  onCellClick: (row: number, col: number) => void;
  highlightedCells?: { row: number; col: number }[];
}

export default function GameBoard({ board, onCellClick, highlightedCells = [] }: GameBoardProps) {
  const isHighlighted = (row: number, col: number) => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  };

  return (
    <div className="bg-game-board p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-8 gap-1">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "aspect-square bg-background rounded-md p-1 flex items-center justify-center",
                "border-2 border-transparent transition-all duration-200",
                isHighlighted(rowIndex, colIndex) && "border-primary ring-2 ring-primary/20",
                "hover:border-primary/50"
              )}
              data-testid={`cell-${rowIndex}-${colIndex}`}
            >
              <GamePiece
                piece={cell.piece}
                onClick={() => onCellClick(rowIndex, colIndex)}
                size="md"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}