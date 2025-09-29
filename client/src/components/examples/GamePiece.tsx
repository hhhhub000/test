import GamePiece from '../GamePiece';
import { GamePiece as GamePieceType } from '@shared/schema';

export default function GamePieceExample() {
  const activePiece: GamePieceType = {
    id: '1',
    player: 1,
    activationTurns: 0,
    expirationTurns: 3,
    isActive: true,
    turnsRemaining: 3
  };

  const inactivePiece: GamePieceType = {
    id: '2', 
    player: 2,
    activationTurns: 2,
    expirationTurns: 4,
    isActive: false,
    turnsRemaining: 0
  };

  const expiringPiece: GamePieceType = {
    id: '3',
    player: 1,
    activationTurns: 0,
    expirationTurns: 1,
    isActive: true,
    turnsRemaining: 1
  };

  return (
    <div className="flex gap-4 p-4">
      <div className="text-center">
        <GamePiece piece={activePiece} />
        <p className="text-sm mt-2 text-muted-foreground">Active</p>
      </div>
      <div className="text-center">
        <GamePiece piece={inactivePiece} />
        <p className="text-sm mt-2 text-muted-foreground">Inactive</p>
      </div>
      <div className="text-center">
        <GamePiece piece={expiringPiece} />
        <p className="text-sm mt-2 text-muted-foreground">Expiring</p>
      </div>
      <div className="text-center">
        <GamePiece piece={null} onClick={() => console.log('Empty slot clicked')} />
        <p className="text-sm mt-2 text-muted-foreground">Empty</p>
      </div>
    </div>
  );
}