import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Player } from "@shared/schema";
import { RotateCcw, Trophy } from "lucide-react";

interface GameInfoProps {
  currentPlayer: Player;
  turnCount: number;
  winner: Player | null;
  gameOver: boolean;
  onReset: () => void;
}

export default function GameInfo({ 
  currentPlayer, 
  turnCount, 
  winner, 
  gameOver, 
  onReset 
}: GameInfoProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Game Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Turn Count:</span>
          <Badge variant="outline">{turnCount}</Badge>
        </div>
        
        {!gameOver && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Current Player:</span>
            <Badge 
              className={`${
                currentPlayer === 1 
                  ? 'bg-game-player1 text-white' 
                  : 'bg-game-player2 text-white'
              }`}
            >
              Player {currentPlayer}
            </Badge>
          </div>
        )}
        
        {gameOver && winner && (
          <div className="text-center py-2">
            <div className="text-lg font-bold text-primary mb-2">
              Game Over!
            </div>
            <Badge 
              className={`text-lg px-4 py-2 ${
                winner === 1 
                  ? 'bg-game-player1 text-white' 
                  : 'bg-game-player2 text-white'
              }`}
            >
              Player {winner} Wins!
            </Badge>
          </div>
        )}
        
        {gameOver && !winner && (
          <div className="text-center py-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Draw Game
            </Badge>
          </div>
        )}
        
        <div className="pt-2">
          <Button 
            onClick={onReset} 
            variant="outline" 
            size="sm" 
            className="w-full"
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Pieces activate after delay</div>
          <div>• Only active pieces count for wins</div>
          <div>• Pieces expire after timer runs out</div>
          <div>• Connect 4 active pieces to win</div>
        </div>
      </CardContent>
    </Card>
  );
}