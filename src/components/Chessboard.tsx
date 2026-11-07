import React, { useState, useRef, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { PieceColor } from '../types/chess';
import { soundEffects } from '../audio/soundEffects';

interface ChessboardProps {
  game: Chess;
  orientation: PieceColor;
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  isInteractive?: boolean;
  highlightSquares?: { square: string; color: 'red' | 'green' | 'yellow' | 'blue' }[];
  lastMove?: { from: string; to: string } | null;
  boardTheme?: 'classic' | 'wood' | 'midnight' | 'emerald' | 'tournament';
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const Chessboard: React.FC<ChessboardProps> = ({
  game,
  orientation,
  onMove,
  isInteractive = true,
  highlightSquares = [],
  lastMove = null,
  boardTheme = 'classic',
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // Check if current king is in check
  const inCheck = game.isCheck();
  let checkKingSquare: string | null = null;
  if (inCheck) {
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (p && p.type === 'k' && p.color === turn) {
          checkKingSquare = `${FILES[f]}${8 - r}`;
          break;
        }
      }
    }
  }

  // Clear selection if turn changed or board updated
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [game.fen()]);

  // Determine ranks & files order based on orientation
  const displayRanks = orientation === 'w' ? [...RANKS] : [...RANKS].reverse();
  const displayFiles = orientation === 'w' ? [...FILES] : [...FILES].reverse();

  // Color schemes (including classic master parchment matching reference)
  const themes = {
    classic: {
      light: 'bg-[#f4ebd0]',
      dark: 'bg-[#b58863]',
      border: 'border-[#634832]',
    },
    wood: {
      light: 'bg-[#e2c19a]',
      dark: 'bg-[#986b41]',
      border: 'border-[#5c3c1e]',
    },
    midnight: {
      light: 'bg-slate-700/60',
      dark: 'bg-slate-900/90',
      border: 'border-slate-800',
    },
    emerald: {
      light: 'bg-[#e8edcc]',
      dark: 'bg-[#5c8b57]',
      border: 'border-[#2d4929]',
    },
    tournament: {
      light: 'bg-[#f0d9b5]',
      dark: 'bg-[#b58863]',
      border: 'border-[#61452a]',
    },
  };

  const currentTheme = themes[boardTheme] || themes.classic;

  const handleSquareClick = (square: string) => {
    if (!isInteractive) return;

    // If already selected, check if clicked square is a legal destination
    if (selectedSquare) {
      const move = legalMoves.find((m) => m.to === square);
      if (move) {
        // Check for promotion
        const piece = game.get(selectedSquare as Square);
        const isPromotion =
          piece &&
          piece.type === 'p' &&
          ((piece.color === 'w' && square.endsWith('8')) || (piece.color === 'b' && square.endsWith('1')));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        // Execute regular move
        onMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
    }

    // Otherwise, select piece if it's the moving player's turn
    const piece = game.get(square as Square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square: square as Square, verbose: true });
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handlePromotionSelection = (pieceType: 'q' | 'r' | 'b' | 'n') => {
    if (pendingPromotion) {
      onMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: pieceType });
      setPendingPromotion(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto select-none touch-manipulation">
      {/* Outer Luxury Board Rim */}
      <div
        ref={boardRef}
        className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 ${currentTheme.border} bg-slate-950`}
      >
        {/* 8x8 Grid */}
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {displayRanks.map((rank, rankIdx) =>
            displayFiles.map((file, fileIdx) => {
              const square = `${file}${rank}`;
              const isDark = (fileIdx + rankIdx) % 2 === 1;
              const piece = game.get(square as Square);
              const isSelected = selectedSquare === square;
              const isLastMove = lastMove?.from === square || lastMove?.to === square;
              const isCheckKing = checkKingSquare === square;

              // Check highlights
              const highlight = highlightSquares.find((h) => h.square === square);

              // Legal move destination
              const legalMove = legalMoves.find((m) => m.to === square);

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                    isDark ? currentTheme.dark : currentTheme.light
                  }`}
                  data-square={square}
                >
                  {/* Last move tile highlight (Authentic tile highlight like Chess.com/Lichess - NO arrows) */}
                  {isLastMove && (
                    <div className="absolute inset-0 bg-[#cdd26a]/50 pointer-events-none transition-colors" />
                  )}

                  {/* Selected Square tile highlight: soft elegant amber tint */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#f7ec7d]/40 ring-2 ring-inset ring-amber-400/60 pointer-events-none" />
                  )}

                  {/* Coach / Hint tile highlight: soft non-intrusive tint */}
                  {highlight && (
                    <div
                      className={`absolute inset-0 pointer-events-none transition-all ${
                        highlight.color === 'green'
                          ? 'bg-[#a3e635]/40 ring-2 ring-inset ring-[#a3e635]/60'
                          : highlight.color === 'red'
                          ? 'bg-rose-500/35 ring-2 ring-inset ring-rose-400/60'
                          : highlight.color === 'yellow'
                          ? 'bg-amber-400/35 ring-2 ring-inset ring-amber-400/60'
                          : 'bg-cyan-500/25'
                      }`}
                    />
                  )}

                  {/* King in Check: soft atmospheric radial glow behind piece */}
                  {isCheckKing && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.7)_0%,_rgba(239,68,68,0)_70%)] pointer-events-none animate-pulse" />
                  )}

                  {/* Rank / File Coordinate Labels */}
                  {fileIdx === 0 && (
                    <span
                      className={`absolute top-0.5 left-1 text-[9px] font-bold ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {rank}
                    </span>
                  )}
                  {rankIdx === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[9px] font-bold ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {file}
                    </span>
                  )}

                  {/* Chess Piece */}
                  {piece && (
                    <div className="w-[82%] h-[82%] relative z-10 transition-transform duration-150 transform hover:scale-105 active:scale-95">
                      <ChessPiece type={piece.type} color={piece.color} />
                    </div>
                  )}

                  {/* Legal Move Indicators */}
                  {legalMove && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      {piece ? (
                        /* Capture target: hollow ring */
                        <div className="w-full h-full rounded-full border-4 border-amber-400/70" />
                      ) : (
                        /* Empty square target: solid dot */
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-400/80 shadow-md" />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pawn Promotion Modal Overlay */}
        {pendingPromotion && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-2xl text-center">
              <h4 className="text-amber-200 font-bold text-sm mb-3">Choose Promotion Piece</h4>
              <div className="flex gap-2">
                {(['q', 'r', 'b', 'n'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handlePromotionSelection(type)}
                    className="w-14 h-14 p-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400 transition-all flex items-center justify-center"
                    aria-label={`Promote to ${type}`}
                  >
                    <ChessPiece type={type} color={game.turn()} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
