import { cn } from "@/lib/utils";
import { GamePiece as GamePieceType } from "@shared/schema";

interface GamePieceProps {
  piece: GamePieceType | null;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  showTimer?: boolean;
}

export default function GamePiece({ piece, onClick, size = "md", showTimer = true }: GamePieceProps) {
  if (!piece) {
    return (
      <div 
        className={cn(
          "rounded-full border-2 border-dashed border-muted-foreground/30 bg-transparent",
          "flex items-center justify-center cursor-pointer hover-elevate",
          size === "sm" && "w-8 h-8",
          size === "md" && "w-12 h-12", 
          size === "lg" && "w-16 h-16"
        )}
        onClick={onClick}
        data-testid="empty-slot"
      />
    );
  }

  const getColorClass = () => {
    if (!piece.isActive) {
      return "bg-game-inactive border-game-inactive";
    }
    if (piece.turnsRemaining <= 1 && piece.isActive) {
      return "bg-game-expiring border-game-expiring animate-pulse";
    }
    return piece.player === 1 
      ? "bg-game-player1 border-game-player1" 
      : "bg-game-player2 border-game-player2";
  };

  return (
    <div 
      className={cn(
        "rounded-full border-2 flex items-center justify-center relative",
        "transition-all duration-200 shadow-sm",
        getColorClass(),
        onClick && "cursor-pointer hover-elevate",
        size === "sm" && "w-8 h-8 text-xs",
        size === "md" && "w-12 h-12 text-sm",
        size === "lg" && "w-16 h-16 text-base"
      )}
      onClick={onClick}
      data-testid={`piece-player${piece.player}-${piece.isActive ? 'active' : 'inactive'}`}
    >
      {showTimer && (
        <span className="font-semibold text-white drop-shadow">
          {piece.isActive ? piece.turnsRemaining : piece.activationTurns}
        </span>
      )}
      {!piece.isActive && (
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {piece.activationTurns}
          </span>
        </div>
      )}
    </div>
  );
}