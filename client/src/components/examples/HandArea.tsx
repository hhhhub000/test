import { useState } from 'react';
import HandArea from '../HandArea';
import { HandPiece } from '@shared/schema';

export default function HandAreaExample() {
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  
  const samplePieces: HandPiece[] = [
    { id: '1', player: 1, activationTurns: 1, expirationTurns: 3 },
    { id: '2', player: 1, activationTurns: 2, expirationTurns: 4 },
    { id: '3', player: 1, activationTurns: 3, expirationTurns: 2 },
    { id: '4', player: 1, activationTurns: 1, expirationTurns: 5 },
    { id: '5', player: 1, activationTurns: 4, expirationTurns: 3 },
  ];

  return (
    <div className="p-4 space-y-4">
      <HandArea
        player={1}
        pieces={samplePieces}
        selectedPieceId={selectedPiece}
        onPieceSelect={(id) => {
          setSelectedPiece(selectedPiece === id ? null : id);
          console.log('Piece selected:', id);
        }}
        isCurrentPlayer={true}
      />
      
      <HandArea
        player={2}
        pieces={samplePieces.map(p => ({ ...p, player: 2 }))}
        selectedPieceId={null}
        onPieceSelect={() => {}}
        isCurrentPlayer={false}
      />
    </div>
  );
}