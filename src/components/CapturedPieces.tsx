import React from 'react';
import { Chess, PieceSymbol } from 'chess.js';
import { ChessPiece } from './ChessPiece';

interface CapturedPiecesProps {
  game: Chess;
  color: 'w' | 'b'; // Which side's captured pieces to display
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ game, color }) => {
  // Initial army
  const initialPieces: Record<PieceSymbol, number> = {
    p: 8,
    n: 2,
    b: 2,
    r: 2,
    q: 1,
    k: 1,
  };

  // Current pieces on board for both sides
  const currentWhite: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const currentBlack: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        if (piece.color === 'w') {
          currentWhite[piece.type] = (currentWhite[piece.type] || 0) + 1;
        } else {
          currentBlack[piece.type] = (currentBlack[piece.type] || 0) + 1;
        }
      }
    }
  }

  // Pieces captured from White (Black holds them)
  const whiteCaptured: { type: PieceSymbol; count: number }[] = [];
  let whiteMaterialLoss = 0;
  for (const [type, count] of Object.entries(initialPieces) as [PieceSymbol, number][]) {
    if (type === 'k') continue;
    const diff = count - (currentWhite[type] || 0);
    if (diff > 0) {
      whiteCaptured.push({ type, count: diff });
      whiteMaterialLoss += diff * PIECE_VALUES[type];
    }
  }

  // Pieces captured from Black (White holds them)
  const blackCaptured: { type: PieceSymbol; count: number }[] = [];
  let blackMaterialLoss = 0;
  for (const [type, count] of Object.entries(initialPieces) as [PieceSymbol, number][]) {
    if (type === 'k') continue;
    const diff = count - (currentBlack[type] || 0);
    if (diff > 0) {
      blackCaptured.push({ type, count: diff });
      blackMaterialLoss += diff * PIECE_VALUES[type];
    }
  }

  // If color === 'w', display pieces that White has captured from Black
  const capturedList = color === 'w' ? blackCaptured : whiteCaptured;
  const capturedPieceColor = color === 'w' ? 'b' : 'w';
  
  // Material advantage
  const materialAdvantage = color === 'w' 
    ? blackMaterialLoss - whiteMaterialLoss 
    : whiteMaterialLoss - blackMaterialLoss;

  if (capturedList.length === 0 && materialAdvantage <= 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
      <div className="flex items-center -space-x-1.5">
        {capturedList.map((item) =>
          Array.from({ length: item.count }).map((_, idx) => (
            <div key={`${item.type}-${idx}`} className="w-4 h-4 shrink-0 drop-shadow-sm">
              <ChessPiece type={item.type} color={capturedPieceColor} />
            </div>
          ))
        )}
      </div>

      {materialAdvantage > 0 && (
        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20 shrink-0">
          +{materialAdvantage}
        </span>
      )}
    </div>
  );
};
