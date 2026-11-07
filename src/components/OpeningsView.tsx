import React, { useState } from 'react';
import { OPENINGS_DATABASE } from '../openings/openingBook';
import { OpeningData } from '../types/chess';
import { Chess } from 'chess.js';
import { Chessboard } from './Chessboard';
import { BookOpen, ShieldAlert, Sparkles, ChevronLeft, ChevronRight, Play, Volume2 } from 'lucide-react';
import { voiceCoach } from '../audio/voiceCoach';

interface OpeningsViewProps {
  onBackToGame: () => void;
  onPlayOpeningOnBoard?: (moves: string[], name: string) => void;
}

export const OpeningsView: React.FC<OpeningsViewProps> = ({ onBackToGame, onPlayOpeningOnBoard }) => {
  const [activeTab, setActiveTab] = useState<'repertoire' | 'traps'>('repertoire');
  const [filterColor, setFilterColor] = useState<'White' | 'Black'>('White');
  const [selectedOpening, setSelectedOpening] = useState<OpeningData>(OPENINGS_DATABASE[0]);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [selectedTrap, setSelectedTrap] = useState<{
    name: string;
    description: string;
    moves: string[];
    warning: string;
  } | null>(null);

  // Generate board state for the current opening & stepIndex
  const currentBoard = React.useMemo(() => {
    const game = new Chess();
    const movesToPlay = selectedTrap ? selectedTrap.moves.slice(0, stepIndex) : selectedOpening.moves.slice(0, stepIndex);

    for (const san of movesToPlay) {
      try {
        const cleanSan = san.replace(/[?!+#]/g, '');
        game.move(cleanSan);
      } catch {
        // Safe skip
      }
    }
    return game;
  }, [selectedOpening, selectedTrap, stepIndex]);

  const handleSelectOpening = (op: OpeningData) => {
    setSelectedOpening(op);
    setSelectedTrap(null);
    setStepIndex(op.moves.length);
  };

  const handleSelectTrap = (trap: { name: string; description: string; moves: string[]; warning: string }) => {
    setSelectedTrap(trap);
    setStepIndex(trap.moves.length);
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleNextStep = () => {
    const max = selectedTrap ? selectedTrap.moves.length : selectedOpening.moves.length;
    if (stepIndex < max) setStepIndex(stepIndex + 1);
  };

  const filteredOpenings = OPENINGS_DATABASE.filter(
    (op) => op.recommendedFor === filterColor || op.recommendedFor === 'Both'
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-2 py-3 text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
            <BookOpen className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 leading-tight">Opening Repertoire</h2>
            <span className="text-[11px] text-slate-400 font-medium">Interactive Theory</span>
          </div>
        </div>

        <button
          onClick={onBackToGame}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700"
        >
          Back to Play
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-slate-800 pb-2.5 mb-3">
        <button
          onClick={() => {
            setActiveTab('repertoire');
            setSelectedTrap(null);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'repertoire'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          Repertoire Lines
        </button>

        <button
          onClick={() => {
            setActiveTab('traps');
            const trap = OPENINGS_DATABASE.flatMap((o) => o.traps || [])[0];
            if (trap) setSelectedTrap(trap);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'traps'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          Opening Traps
        </button>
      </div>

      {/* REPERTOIRE TAB */}
      {activeTab === 'repertoire' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Left Column: Repertoire List */}
          <div className="md:col-span-5 space-y-2">
            {/* White vs Black Toggle */}
            <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterColor('White')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterColor === 'White'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                White
              </button>
              <button
                onClick={() => setFilterColor('Black')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterColor === 'Black'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Black
              </button>
            </div>

            <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredOpenings.map((op) => {
                const isSelected = selectedOpening.name === op.name && selectedOpening.variation === op.variation;
                return (
                  <div
                    key={`${op.eco}-${op.name}-${op.variation}`}
                    onClick={() => handleSelectOpening(op)}
                    className={`p-2.5 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-100 truncate pr-2">{op.name}</span>
                      <span className="font-mono text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
                        {op.eco}
                      </span>
                    </div>
                    {op.variation && (
                      <span className="text-[11px] text-amber-300/80 block truncate font-medium">
                        {op.variation}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Repertoire Board */}
          <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="truncate pr-2">
                <h3 className="font-bold text-sm text-amber-100 truncate">
                  {selectedOpening.name}
                  {selectedOpening.variation && ` • ${selectedOpening.variation}`}
                </h3>
              </div>

              {onPlayOpeningOnBoard && (
                <button
                  onClick={() => onPlayOpeningOnBoard(selectedOpening.moves, `${selectedOpening.name}: ${selectedOpening.variation || ''}`)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors shrink-0"
                  title="Play this opening on the board"
                >
                  <Play className="w-3 h-3 fill-slate-950" />
                  Play Line
                </button>
              )}
            </div>

            {/* Chessboard */}
            <div className="max-w-[280px] mx-auto mb-2.5">
              <Chessboard
                game={currentBoard}
                orientation={filterColor === 'White' ? 'w' : 'b'}
                onMove={() => {}}
                isInteractive={false}
                boardTheme="midnight"
              />
            </div>

            {/* Step navigation controls */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <button
                onClick={() => setStepIndex(0)}
                className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white"
              >
                Start
              </button>
              <button
                onClick={handlePrevStep}
                disabled={stepIndex === 0}
                className="p-1 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-amber-300 px-1">
                Move {stepIndex} / {selectedOpening.moves.length}
              </span>
              <button
                onClick={handleNextStep}
                disabled={stepIndex === selectedOpening.moves.length}
                className="p-1 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setStepIndex(selectedOpening.moves.length)}
                className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white"
              >
                Full Line
              </button>
            </div>

            {/* Moves Notation Strip */}
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-[11px] text-amber-200/90 text-center truncate">
              {selectedOpening.moves.join(' ')}
            </div>
          </div>
        </div>
      )}

      {/* TRAPS TAB */}
      {activeTab === 'traps' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Opening Traps
            </span>
            {OPENINGS_DATABASE.flatMap((o) => o.traps || []).map((trap) => {
              const isSelected = selectedTrap?.name === trap.name;
              return (
                <div
                  key={trap.name}
                  onClick={() => handleSelectTrap(trap)}
                  className={`p-2.5 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-500/50 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-bold text-xs text-slate-100 truncate">{trap.name}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm">
            {selectedTrap ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-rose-300 flex items-center gap-1.5 truncate">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="truncate">{selectedTrap.name}</span>
                  </h3>
                  {onPlayOpeningOnBoard && (
                    <button
                      onClick={() => onPlayOpeningOnBoard(selectedTrap.moves, selectedTrap.name)}
                      className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 font-bold text-xs flex items-center gap-1 shrink-0"
                    >
                      <Play className="w-3 h-3 fill-rose-300" />
                      Try Line
                    </button>
                  )}
                </div>

                <div className="max-w-[280px] mx-auto mb-2">
                  <Chessboard
                    game={currentBoard}
                    orientation="w"
                    onMove={() => {}}
                    isInteractive={false}
                    boardTheme="tournament"
                  />
                </div>

                {/* Step controls */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <button
                    onClick={handlePrevStep}
                    disabled={stepIndex === 0}
                    className="p-1 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    Step {stepIndex} / {selectedTrap.moves.length}
                  </span>
                  <button
                    onClick={handleNextStep}
                    disabled={stepIndex === selectedTrap.moves.length}
                    className="p-1 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-[11px] text-amber-200/90 text-center truncate">
                  {selectedTrap.moves.join(' ')}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-xs text-center py-8">Select a trap to inspect.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
