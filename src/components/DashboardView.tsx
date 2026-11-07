import React, { useState } from 'react';
import { getPlayerStats, resetPlayerStats } from '../storage/gameStorage';
import { DifficultyLevel } from '../types/chess';
import { BarChart3, TrendingUp, Trophy, AlertTriangle, Play, Sparkles, Award, RotateCcw } from 'lucide-react';

interface DashboardViewProps {
  onBackToGame: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBackToGame }) => {
  const [stats, setStats] = useState(() => getPlayerStats());

  const handleReset = () => {
    if (window.confirm('Reset all match stats to 0?')) {
      const fresh = resetPlayerStats();
      setStats(fresh);
    }
  };

  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
  const difficulties: DifficultyLevel[] = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert', 'Master'];

  return (
    <div className="w-full max-w-4xl mx-auto px-2 py-3 text-slate-100">
      {/* Header - Clean & Minimal without text walls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
            <BarChart3 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 leading-tight">Match Records & Stats</h2>
            <span className="text-[11px] text-slate-400 font-medium">Your Real Game History</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {stats.totalGames > 0 && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-750 transition-colors"
              title="Reset stats"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onBackToGame}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            Back to Play
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Total Matches
          </span>
          <span className="text-xl font-extrabold text-slate-100 font-mono">
            {stats.totalGames}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
            {stats.wins} Wins • {stats.losses} Losses • {stats.draws} Draws
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/30 shadow-sm">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-0.5">
            Win Rate
          </span>
          <span className="text-xl font-extrabold text-amber-200 font-mono">
            {winRate}%
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
            <TrendingUp className="w-3 h-3" />
            {stats.totalGames > 0 ? `${stats.wins} victories` : 'Start playing'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Avg Accuracy
          </span>
          <span className="text-xl font-extrabold text-slate-100 font-mono">
            {stats.totalGames > 0 ? `${stats.averageAccuracy}%` : '--'}
          </span>
          <span className="text-[10px] text-cyan-400 block mt-0.5 font-medium">
            Engine verified
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Endgame Conversion
          </span>
          <span className="text-xl font-extrabold text-slate-100 font-mono">
            {stats.totalGames > 0 ? `${stats.endgameConversionRate}%` : '--'}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5 font-medium">
            Advantage closed
          </span>
        </div>
      </div>

      {/* Empty State Banner if 0 games */}
      {stats.totalGames === 0 ? (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-2 text-lg">
            ♟
          </div>
          <h3 className="font-bold text-sm text-slate-100 mb-1">No Matches Played Yet</h3>
          <p className="text-xs text-slate-400 mb-3 max-w-sm mx-auto">
            Play your first game against Dr. Drona to record your wins, analyze your tactical accuracy, and track openings!
          </p>
          <button
            onClick={onBackToGame}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            Play First Match
          </button>
        </div>
      ) : (
        <>
          {/* Visual Skill Matrix (No long text walls) */}
          <div className="mb-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs text-amber-200 uppercase tracking-wider">
                  Skill Performance
                </h3>
              </div>
              <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
                {stats.totalGames} Games Analyzed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Accuracy</span>
                  <span className="font-mono font-bold text-emerald-400">{stats.averageAccuracy}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${stats.averageAccuracy}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Win Rate</span>
                  <span className="font-mono font-bold text-amber-300">{winRate}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${winRate}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Endgames</span>
                  <span className="font-mono font-bold text-cyan-400">{stats.endgameConversionRate}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${stats.endgameConversionRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
            {/* Performance by AI Difficulty */}
            <div className="md:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Performance by Level
              </h3>

              <div className="space-y-1.5">
                {difficulties.map((level) => {
                  const rec = stats.difficultyStats[level] || { games: 0, wins: 0, losses: 0, draws: 0 };
                  const rate = rec.games > 0 ? Math.round((rec.wins / rec.games) * 100) : 0;
                  return (
                    <div key={level} className="p-1.5 px-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-200">{level}</span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {rec.wins}W / {rec.losses}L ({rate}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recurring Errors */}
            <div className="md:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Error Patterns
              </h3>

              <div className="space-y-2">
                {stats.frequentMistakes.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No mistakes recorded yet.</p>
                ) : (
                  stats.frequentMistakes.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between text-xs">
                      <span className="font-semibold text-rose-200">{m.category}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 font-mono">
                        {m.count}x
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Opening Win Rates */}
          {Object.keys(stats.openingsStats).length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Opening Win Rates
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(stats.openingsStats).map(([name, data]) => {
                  const opWinRate = data.played > 0 ? Math.round((data.wins / data.played) * 100) : 0;
                  return (
                    <div key={name} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                      <span className="font-bold text-slate-200 block truncate text-[11px] mb-1">{name}</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-300">{opWinRate}%</span>
                        <span className="text-[10px] text-slate-400 font-mono">{data.wins}W-{data.losses}L</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
