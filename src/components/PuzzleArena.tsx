import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from './Chessboard';
import { soundEffects } from '../audio/soundEffects';
import { voiceCoach } from '../audio/voiceCoach';
import { Sparkles, Trophy, Zap, RotateCcw, ArrowRight, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PuzzleArenaProps {
  onBackToHome: () => void;
}

interface PuzzleItem {
  id: string;
  title: string;
  theme: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  fen: string;
  turn: 'w' | 'b';
  solutionMoves: { from: string; to: string; promotion?: string }[];
  hint: string;
  rating: number;
}

const PUZZLE_COLLECTION: PuzzleItem[] = [
  {
    id: 'pz-1',
    title: 'Smothered Mate Threat',
    theme: 'Knight Fork & Checkmate',
    difficulty: 'Easy',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    turn: 'w',
    solutionMoves: [{ from: 'e1', to: 'e8' }],
    hint: 'Look at Black\'s trapped king behind their own pawns on the 8th rank!',
    rating: 600,
  },
  {
    id: 'pz-2',
    title: 'Royal Knight Fork',
    theme: 'Fork Tactic',
    difficulty: 'Medium',
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 6',
    turn: 'w',
    solutionMoves: [{ from: 'd3', to: 'e4' }],
    hint: 'Black left their knight completely undefended on e4. Win the piece!',
    rating: 950,
  },
  {
    id: 'pz-3',
    title: 'Pin to the King',
    theme: 'Absolute Pin',
    difficulty: 'Medium',
    fen: 'r1b1k2r/pppp1ppp/8/4q3/1bP5/2N1P3/PP3PPP/R2QKB1R w KQkq - 0 10',
    turn: 'w',
    solutionMoves: [{ from: 'd1', to: 'd4' }],
    hint: 'Centralize the queen with a double threat on Black\'s unprotected bishop and pinned queen.',
    rating: 1200,
  },
  {
    id: 'pz-4',
    title: 'Back-Rank Decoy Mate',
    theme: 'Back-Rank Mate',
    difficulty: 'Medium',
    fen: '3r2k1/p4ppp/1p6/8/8/2Q5/PP3PPP/6K1 w - - 0 1',
    turn: 'w',
    solutionMoves: [{ from: 'c3', to: 'c8' }],
    hint: 'Deflection sacrifice on c8 allows an immediate back-rank mate!',
    rating: 1350,
  },
  {
    id: 'pz-5',
    title: 'Queen & Bishop Battery Mate',
    theme: 'Checkmate Pattern',
    difficulty: 'Easy',
    fen: 'r1b2rk1/ppp2ppp/2n5/3qp3/1b2N3/3P1Q2/PPP2PPP/R1B1K1NR w KQ - 0 8',
    turn: 'w',
    solutionMoves: [{ from: 'e4', to: 'f6' }],
    hint: 'Unleash a discovered check and royal fork on Black\'s king and queen!',
    rating: 1100,
  },
];

export const PuzzleArena: React.FC<PuzzleArenaProps> = ({ onBackToHome }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [puzzleRating, setPuzzleRating] = useState(1200);
  const [streak, setStreak] = useState(0);
  const currentPuzzle = PUZZLE_COLLECTION[currentIndex];

  const [puzzleGame, setPuzzleGame] = useState(() => new Chess(currentPuzzle.fen));
  const [status, setStatus] = useState<'idle' | 'solved' | 'failed'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hintShown, setHintShown] = useState(false);

  const loadPuzzle = (index: number) => {
    setCurrentIndex(index);
    const pz = PUZZLE_COLLECTION[index];
    setPuzzleGame(new Chess(pz.fen));
    setStatus('idle');
    setFeedback(null);
    setHintShown(false);
  };

  const handleMove = (move: { from: string; to: string; promotion?: string }) => {
    if (status === 'solved') return;

    try {
      const clone = new Chess(puzzleGame.fen());
      const res = clone.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q',
      });

      if (!res) return;

      soundEffects.playMove();

      const expected = currentPuzzle.solutionMoves[0];
      const isCorrect = move.from === expected.from && move.to === expected.to;

      if (isCorrect) {
        soundEffects.playVictory();
        setStatus('solved');
        setFeedback(`Brilliant! ${res.san} solves the puzzle!`);
        voiceCoach.speak(`Excellent move! You found ${res.san} cleanly.`, 'urgent');
        setPuzzleRating((prev) => prev + 15);
        setStreak((prev) => prev + 1);
        confetti({ particleCount: 50, spread: 45 });
        setPuzzleGame(clone);
      } else {
        soundEffects.playBlunderAlert();
        setStatus('failed');
        setFeedback(`${res.san} is not the best tactic. Try again or check the hint!`);
        voiceCoach.speak('Not the best tactic. Look for king threats or hanging pieces!', 'normal');
        setStreak(0);
        setPuzzleGame(clone);
      }
    } catch {
      // Invalid move
    }
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % PUZZLE_COLLECTION.length;
    loadPuzzle(nextIdx);
  };

  const handleReset = () => {
    setPuzzleGame(new Chess(currentPuzzle.fen));
    setStatus('idle');
    setFeedback(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-2 py-3 text-slate-100 flex flex-col gap-3">
      {/* Top Header Card */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
              Tactics Arena
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                #{currentIndex + 1}
              </span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              Find the winning move
            </span>
          </div>
        </div>

        {/* Live Rating & Streak */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1 text-amber-300 font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{puzzleRating}</span>
          </div>
          <div className="px-2 py-1 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center gap-1 text-orange-300 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>{streak} 🔥</span>
          </div>
        </div>
      </div>

      {/* Puzzle Objective Ribbon */}
      <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-200">{currentPuzzle.title}</span>
          <span className="text-[10px] text-slate-400">• {currentPuzzle.theme}</span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            currentPuzzle.difficulty === 'Easy'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}
        >
          {currentPuzzle.difficulty}
        </span>
      </div>

      {/* The Chessboard */}
      <div className="w-full max-w-[380px] mx-auto">
        <Chessboard
          game={puzzleGame}
          orientation={currentPuzzle.turn}
          onMove={handleMove}
          isInteractive={status !== 'solved'}
          boardTheme="midnight"
        />
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 ${
            status === 'solved'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}
        >
          {status === 'solved' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{feedback}</span>
        </div>
      )}

      {/* Hint reveal */}
      {hintShown && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-center font-medium">
          💡 <strong>Dr. Drona:</strong> {currentPuzzle.hint}
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={handleReset}
          className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry
        </button>

        <button
          onClick={() => {
            setHintShown(true);
            voiceCoach.speak(currentPuzzle.hint, 'urgent');
          }}
          className="flex-1 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-xs font-bold text-amber-300 border border-amber-500/30 transition-colors flex items-center justify-center gap-1"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Get Hint
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-extrabold text-slate-950 transition-all flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
        >
          <span>Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
