import React, { useState } from 'react';
import { ENDGAME_DRILLS } from '../endgames/endgameDrills';
import { EndgameDrill } from '../types/chess';
import { Chess } from 'chess.js';
import { Chessboard } from './Chessboard';
import { ChessEngine } from '../engine/chessEngine';
import { soundEffects } from '../audio/soundEffects';
import { voiceCoach } from '../audio/voiceCoach';
import { RotateCcw, Lightbulb, Compass, ArrowLeft, Play, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EndgameViewProps {
  onBackToGame: () => void;
  onPlayOnMainBoard?: (fen: string, title: string, turn: 'w' | 'b') => void;
}

export const EndgameView: React.FC<EndgameViewProps> = ({ onBackToGame, onPlayOnMainBoard }) => {
  const [selectedDrill, setSelectedDrill] = useState<EndgameDrill>(ENDGAME_DRILLS[0]);
  const [drillGame, setDrillGame] = useState<Chess>(() => new Chess(ENDGAME_DRILLS[0].fen));
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [drillEngine] = useState(() => new ChessEngine('Intermediate'));

  const resetDrill = (drill: EndgameDrill = selectedDrill) => {
    setSelectedDrill(drill);
    setDrillGame(new Chess(drill.fen));
    setIsCompleted(false);
    setFeedback(null);
  };

  const handleUserMove = (move: { from: string; to: string; promotion?: string }) => {
    if (isCompleted) return;

    try {
      const clone = new Chess(drillGame.fen());
      const result = clone.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q',
      });

      if (!result) return;

      soundEffects.playMove();

      // Check for completion
      if (clone.isCheckmate()) {
        soundEffects.playVictory();
        setIsCompleted(true);
        setFeedback('Checkmate delivered! Masterful execution.');
        voiceCoach.speak('Masterful execution! You achieved checkmate with precision.', 'urgent');
        confetti({ particleCount: 60, spread: 50 });
        setDrillGame(clone);
        return;
      }

      // Check for promotion
      if (result.promotion) {
        soundEffects.playVictory();
        setIsCompleted(true);
        setFeedback('Pawn successfully promoted to Queen!');
        voiceCoach.speak('Pawn promoted to Queen! Well done.', 'urgent');
        confetti({ particleCount: 60, spread: 50 });
        setDrillGame(clone);
        return;
      }

      setDrillGame(clone);
      setFeedback('Calculating AI defense...');

      // AI opponent response
      setTimeout(() => {
        if (clone.isGameOver()) return;
        const aiMoveResult = drillEngine.findBestMove(clone, 'Intermediate');
        if (aiMoveResult.move) {
          clone.move(aiMoveResult.move);
          soundEffects.playMove();
          setDrillGame(new Chess(clone.fen()));

          if (clone.isCheck()) {
            soundEffects.playCheck();
          }

          if (clone.isGameOver()) {
            if (clone.isDraw()) {
              setFeedback('Drawn position.');
              setIsCompleted(true);
            }
          } else {
            setFeedback('Your turn.');
          }
        }
      }, 300);
    } catch {
      // invalid move
    }
  };

  const speakHint = () => {
    voiceCoach.speak(selectedDrill.drDronaHint, 'urgent');
    setFeedback(`Tip: ${selectedDrill.drDronaHint}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 py-3 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
            <Compass className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 leading-tight">Endgame Drills</h2>
            <span className="text-[11px] text-slate-400 font-medium">Interactive Practice</span>
          </div>
        </div>

        <button
          onClick={onBackToGame}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Play
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left Column: Drills Menu (Compact, No text paragraphs) */}
        <div className="md:col-span-5 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            Choose Drill
          </span>
          <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
            {ENDGAME_DRILLS.map((drill) => {
              const isSelected = selectedDrill.id === drill.id;
              return (
                <div
                  key={drill.id}
                  onClick={() => resetDrill(drill)}
                  className={`p-2.5 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/50 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100 truncate pr-2">
                      {drill.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        drill.difficulty === 'Beginner'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : drill.difficulty === 'Intermediate'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {drill.difficulty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Board */}
        <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-bold text-sm text-amber-100 truncate pr-2">
              {selectedDrill.title}
            </h3>

            <div className="flex items-center gap-1.5">
              <button
                onClick={speakHint}
                className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1"
                title="Get Dr. Drona's spoken hint"
              >
                <Lightbulb className="w-3 h-3" />
                Hint
              </button>
              <button
                onClick={() => resetDrill()}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300"
                title="Reset drill position"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              {onPlayOnMainBoard && (
                <button
                  onClick={() => onPlayOnMainBoard(selectedDrill.fen, selectedDrill.title, selectedDrill.turn)}
                  className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1"
                  title="Play this drill on the main game board"
                >
                  <Play className="w-3 h-3 fill-emerald-300" />
                  Main Board
                </button>
              )}
            </div>
          </div>

          {/* Chessboard */}
          <div className="max-w-[280px] mx-auto mb-2.5">
            <Chessboard
              game={drillGame}
              orientation={selectedDrill.turn}
              onMove={handleUserMove}
              isInteractive={!isCompleted}
              boardTheme="wood"
            />
          </div>

          {/* Status Message */}
          {feedback && (
            <div
              className={`p-2 rounded-xl text-xs font-semibold text-center ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-950 text-amber-200 border border-slate-800'
              }`}
            >
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
