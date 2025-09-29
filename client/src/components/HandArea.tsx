import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HandPiece, Player } from "@shared/schema";
import GamePiece from "./GamePiece";

interface HandAreaProps {
  player: Player;
  pieces: HandPiece[];
  selectedPieceId: string | null;
  onPieceSelect: (pieceId: string) => void;
  isCurrentPlayer: boolean;
}

export default function HandArea({ 
  player, 
  pieces, 
  selectedPieceId, 
  onPieceSelect, 
  isCurrentPlayer 
}: HandAreaProps) {
  const playerColor = player === 1 ? "text-game-player1" : "text-game-player2";
  
  return (
    <Card className={`transition-all duration-200 ${isCurrentPlayer ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-lg ${playerColor}`}>
          Player {player} Hand {isCurrentPlayer && "(Your Turn)"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {pieces.map((piece) => (
            <div
              key={piece.id}
              className={`
                p-2 rounded-md border-2 transition-all cursor-pointer
                ${selectedPieceId === piece.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-transparent hover:border-primary/50'
                }
                ${!isCurrentPlayer ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => isCurrentPlayer && onPieceSelect(piece.id)}
              data-testid={`hand-piece-${piece.id}`}
            >
              <div className="flex flex-col items-center gap-1">
                <GamePiece
                  piece={{
                    ...piece,
                    isActive: false,
                    turnsRemaining: 0
                  }}
                  size="sm"
                  showTimer={false}
                />
                <div className="text-xs text-center text-muted-foreground">
                  <div>Act: {piece.activationTurns}</div>
                  <div>Exp: {piece.expirationTurns}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {pieces.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No pieces remaining
          </div>
        )}
        
        {selectedPieceId && isCurrentPlayer && (
          <div className="text-sm text-muted-foreground text-center">
            Selected piece ready to place
          </div>
        )}
      </CardContent>
    </Card>
  );
}