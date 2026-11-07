import React, { useState } from 'react';
import { getPlayerStats } from '../storage/gameStorage';
import { Chess } from 'chess.js';
import { Chessboard } from './Chessboard';
import { soundEffects } from '../audio/soundEffects';
import { voiceCoach } from '../audio/voiceCoach';
import { Target, Zap, Shield, Sparkles, CheckCircle2, RotateCcw, ArrowRight, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrainingViewProps {
  onNavigateToOpenings: () => void;
  onNavigateToEndgames: () => void;
  onBackToGame: () => void;
}

// Interactive tactical puzzles designed for personal mistake correction
const TACTICAL_PUZZLES = [
  {
    id: 'tactics-fork-1',
    title: 'Exploit the Royal Fork',
    theme: 'Knight Fork',
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 6',
    turn: 'w' as const,
    solution: { from: 'd3', to: 'e4' },
    goal: 'Win the undefended knight on e4'
  },
  {
    id: 'tactics-pin-1',
    title: 'Pin Queen to King',
    theme: 'Absolute Pin',
    fen: 'r1b1k2r/pppp1ppp/8/4q3/1bP5/2N1P3/PP3PPP/R2QKB1R w KQkq - 0 10',
    turn: 'w' as const,
    solution: { from: 'd1', to: 'd4' },
    goal: 'Find dominating central queen move'
  },
  {
    id: 'tactics-backrank-1',
    title: 'Defend King Safety',
    theme: 'King Safety',
    fen: 'r1bqk2r/ppppbppp/2n5/4P3/2B5/5N2/PPP2PPP/RNBQ1RK1 b kq - 0 7',
    turn: 'b' as const,
    solution: { from: 'e8', to: 'g8' },
    goal: 'Castle immediately to safety'
  }
];

export const TrainingView: React.FC<TrainingViewProps> = ({
  onNavigateToOpenings,
  onNavigateToEndgames,
  onBackToGame,
}) => {
  const [stats] = useState(() => getPlayerStats());

  const [activePuzzleIndex, setActivePuzzleIndex] = useState(0);
  const activePuzzle = TACTICAL_PUZZLES[activePuzzleIndex];
  const [puzzleGame, setPuzzleGame] = useState(() => new Chess(activePuzzle.fen));
  const [puzzleFeedback, setPuzzleFeedback] = useState<string | null>(null);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);

  const resetPuzzle = (idx: number) => {
    setActivePuzzleIndex(idx);
    const pz = TACTICAL_PUZZLES[idx];
    setPuzzleGame(new Chess(pz.fen));
    setPuzzleFeedback(null);
    setIsPuzzleSolved(false);
  };

  const handlePuzzleMove = (move: { from: string; to: string; promotion?: string }) => {
    if (isPuzzleSolved) return;

    try {
      const clone = new Chess(puzzleGame.fen());
      const result = clone.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q',
      });

      if (!result) return;

      soundEffects.playMove();

      // Check against solution
      const isCorrect = move.from === activePuzzle.solution.from && move.to === activePuzzle.solution.to;

      if (isCorrect) {
        soundEffects.playVictory();
        setIsPuzzleSolved(true);
        setPuzzleFeedback(`Solved! ${result.san} is best.`);
        voiceCoach.speak(`Excellent move! You found ${result.san}.`, 'urgent');
        confetti({ particleCount: 50, spread: 45 });
        setPuzzleGame(clone);
      } else {
        soundEffects.playBlunderAlert();
        setPuzzleFeedback(`Move ${result.san} is not optimal. Try again!`);
        voiceCoach.speak('Not quite the sharpest move. Try again!', 'normal');
        setPuzzleGame(clone);
      }
    } catch {
      // invalid move
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 py-3 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 leading-tight">Training Plan</h2>
            <span className="text-[11px] text-slate-400 font-medium">Personalized Drills</span>
          </div>
        </div>

        <button
          onClick={onBackToGame}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
        >
          Back to Play
        </button>
      </div>

      {/* Focus Areas (Clean cards, no walls of text) */}
      <div className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                  Opening Repertoire
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">50% Win Rate</span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 mb-2">Queen's Gambit</h4>
            </div>

            <button
              onClick={onNavigateToOpenings}
              className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-xs font-bold text-amber-200 border border-slate-700 hover:border-amber-500/40 transition-all flex items-center justify-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Train Opening</span>
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                  Tactics & Calculation
                </span>
                <span className="text-[10px] font-mono text-rose-300 font-semibold">8 Errors</span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 mb-2">Knight Fork Defense</h4>
            </div>

            <button
              onClick={() => resetPuzzle(0)}
              className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-xs font-bold text-amber-200 border border-slate-700 hover:border-amber-500/40 transition-all flex items-center justify-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Solve Tactics</span>
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                  Endgame Conversion
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">75% Conversion</span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 mb-2">King & Pawn Drills</h4>
            </div>

            <button
              onClick={onNavigateToEndgames}
              className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-xs font-bold text-amber-200 border border-slate-700 hover:border-amber-500/40 transition-all flex items-center justify-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Practice Endgame</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tactical Exercise Board */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950">
              Drill #{activePuzzleIndex + 1}
            </span>
            <h3 className="font-bold text-sm text-slate-100">{activePuzzle.title}</h3>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">• {activePuzzle.goal}</span>
          </div>

          <div className="flex gap-1">
            {TACTICAL_PUZZLES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => resetPuzzle(idx)}
                className={`w-6 h-6 rounded-lg text-xs font-bold transition-all ${
                  activePuzzleIndex === idx
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-7 max-w-[280px] mx-auto w-full">
            <Chessboard
              game={puzzleGame}
              orientation={activePuzzle.turn}
              onMove={handlePuzzleMove}
              isInteractive={!isPuzzleSolved}
              boardTheme="midnight"
            />
          </div>

          <div className="sm:col-span-5 space-y-2">
            {puzzleFeedback && (
              <div
                className={`p-2.5 rounded-xl text-xs font-semibold text-center ${
                  isPuzzleSolved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {puzzleFeedback}
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-400">Objective</span>
              <span className="text-amber-200 font-semibold">{activePuzzle.goal}</span>
            </div>

            <button
              onClick={() => resetPuzzle(activePuzzleIndex)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
