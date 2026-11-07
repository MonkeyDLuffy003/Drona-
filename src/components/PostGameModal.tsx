import React, { useState } from 'react';
import { GameSummary, EvaluatedMove } from '../types/chess';
import { Chess } from 'chess.js';
import { Chessboard } from './Chessboard';
import { Trophy, AlertOctagon, RotateCcw, Award, CheckCircle, TrendingUp, Sparkles, X, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostGameModalProps {
  summary: GameSummary;
  onClose: () => void;
  onPlayAgain: () => void;
}

export const PostGameModal: React.FC<PostGameModalProps> = ({ summary, onClose, onPlayAgain }) => {
  const [retryMoveIndex, setRetryMoveIndex] = useState<number | null>(null);
  const [retryGame, setRetryGame] = useState<Chess | null>(null);
  const [retryFeedback, setRetryFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    if (summary.result === 'win') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [summary.result]);

  const startRetryMistake = (moveIdx: number) => {
    const move = summary.moves[moveIdx];
    if (!move) return;
    setRetryMoveIndex(moveIdx);
    setRetryGame(new Chess(move.fenBefore));
    setRetryFeedback(null);
  };

  const handleRetryMove = (userMove: { from: string; to: string; promotion?: string }) => {
    if (!retryGame || retryMoveIndex === null) return;
    const originalMove = summary.moves[retryMoveIndex];
    if (!originalMove) return;

    try {
      const clone = new Chess(retryGame.fen());
      const res = clone.move({
        from: userMove.from,
        to: userMove.to,
        promotion: userMove.promotion || 'q',
      });

      if (!res) return;

      if (res.san === originalMove.bestMoveSan || (userMove.from === originalMove.bestMoveFrom && userMove.to === originalMove.bestMoveTo)) {
        setRetryFeedback(`Superb! You found Dr. Drona's recommended move (${originalMove.bestMoveSan}). Great improvement!`);
        setRetryGame(clone);
      } else {
        setRetryFeedback(`Good try with ${res.san}, but the optimal grandmaster move was ${originalMove.bestMoveSan}. Keep practicing!`);
        setRetryGame(clone);
      }
    } catch {
      // invalid move
    }
  };

  // Find mistakes and blunders
  const mistakeMoves = summary.moves
    .map((m, idx) => ({ ...m, idx }))
    .filter((m) => m.classification === 'blunder' || m.classification === 'mistake');

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-3xl p-5 shadow-2xl text-slate-100 my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Game Result Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 mb-2 shadow-lg shadow-amber-500/10">
            {summary.result === 'win' ? (
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            ) : summary.result === 'loss' ? (
              <AlertOctagon className="w-8 h-8 text-rose-400" />
            ) : (
              <Award className="w-8 h-8 text-cyan-400" />
            )}
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-amber-100">
            {summary.result === 'win'
              ? 'Victory! Outstanding Play'
              : summary.result === 'loss'
              ? 'Game Over - Lessons for Growth'
              : 'Drawn Match'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {summary.resultReason} • {summary.movesCount} Moves • Difficulty: {summary.difficulty}
          </p>
        </div>

        {/* Accuracy Comparison Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/30 text-center">
            <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block mb-1">
              Your Accuracy
            </span>
            <span className="text-3xl font-extrabold text-amber-200 font-mono">
              {summary.playerAccuracy}%
            </span>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${summary.playerAccuracy}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              AI Opponent Accuracy
            </span>
            <span className="text-3xl font-extrabold text-slate-200 font-mono">
              {summary.aiAccuracy}%
            </span>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${summary.aiAccuracy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Phase Breakdown */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Game Phase Performance
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Opening</span>
              <span className="font-bold text-amber-300 text-sm font-mono">
                {summary.phaseAccuracy.opening}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Middlegame</span>
              <span className="font-bold text-amber-300 text-sm font-mono">
                {summary.phaseAccuracy.middlegame}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Endgame</span>
              <span className="font-bold text-amber-300 text-sm font-mono">
                {summary.phaseAccuracy.endgame}%
              </span>
            </div>
          </div>
        </div>

        {/* Move Classifications Count Pills */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Move Quality Breakdown
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {summary.classifications.brilliant > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                {summary.classifications.brilliant} Brilliant !!
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              {summary.classifications.best} Best ★
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
              {summary.classifications.excellent} Excellent
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
              {summary.classifications.good} Good
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              {summary.classifications.inaccuracy} Inaccuracies
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold">
              {summary.classifications.mistake} Mistakes
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/25 text-rose-300 border border-rose-500/40 font-semibold">
              {summary.classifications.blunder} Blunders
            </span>
          </div>
        </div>

        {/* Dr. Drona's Coach Takeaway */}
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
              ♚
            </span>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              Dr. Drona's Personal Coaching Feedback
            </h4>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed italic">
            "{summary.drDronaTakeaway}"
          </p>
        </div>

        {/* Interactive "Retry Mistake" / Turning Points */}
        {mistakeMoves.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Critical Turning Points — Practice & Retry Mistakes
            </h3>

            {retryGame && retryMoveIndex !== null ? (
              <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-200">
                    Fixing Move {summary.moves[retryMoveIndex].moveNumber}:{' '}
                    <span className="line-through text-rose-400">
                      {summary.moves[retryMoveIndex].san}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      setRetryGame(null);
                      setRetryMoveIndex(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Cancel Drill
                  </button>
                </div>

                <div className="max-w-[280px] mx-auto mb-2">
                  <Chessboard
                    game={retryGame}
                    orientation={summary.playerColor}
                    onMove={handleRetryMove}
                    boardTheme="tournament"
                  />
                </div>

                {retryFeedback ? (
                  <p className="text-xs text-center font-medium p-2 rounded-lg bg-slate-900 text-amber-200 border border-amber-500/20">
                    {retryFeedback}
                  </p>
                ) : (
                  <p className="text-xs text-center text-slate-400">
                    Play the best alternative move on the board above to correct your mistake.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {mistakeMoves.slice(0, 3).map((m) => (
                  <div
                    key={m.idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-200">
                        Move {m.moveNumber}. {m.san}
                      </span>
                      <span
                        className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          m.classification === 'blunder'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-orange-500/20 text-orange-300'
                        }`}
                      >
                        {m.classification}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {m.coachExplanation}
                      </p>
                    </div>

                    <button
                      onClick={() => startRetryMistake(m.idx)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold flex items-center gap-1 shrink-0 ml-2 border border-amber-500/40"
                    >
                      <span>Retry</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Play Next Game
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-sm border border-slate-700 transition-all"
          >
            Review Board
          </button>
        </div>
      </div>
    </div>
  );
};
