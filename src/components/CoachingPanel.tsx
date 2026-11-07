import React from 'react';
import { EvaluatedMove, MoveClassification } from '../types/chess';
import { AlertTriangle, CheckCircle, Volume2, Eye, ShieldAlert, Award, Lightbulb, GraduationCap, Sparkles } from 'lucide-react';
import { voiceCoach } from '../audio/voiceCoach';
import { SupportedLanguage, TRANSLATIONS, getTranslatedExplanation } from '../i18n/languages';

interface CoachingPanelProps {
  lastEvaluatedMove: EvaluatedMove | null;
  currentEval: number;
  onShowAlternative: () => void;
  isShowingAlternative: boolean;
  coachHint: string | null;
  onAskHint: () => void;
  isPlayerTurn: boolean;
  gameStatus: string;
  gameMode: 'match' | 'coach';
  language: SupportedLanguage;
}

export const CoachingPanel: React.FC<CoachingPanelProps> = ({
  lastEvaluatedMove,
  currentEval,
  onShowAlternative,
  isShowingAlternative,
  coachHint,
  onAskHint,
  isPlayerTurn,
  gameStatus,
  gameMode,
  language,
}) => {
  const replayVoice = (text: string) => {
    voiceCoach.speak(text, 'urgent');
  };

  const getClassificationBadge = (classification: MoveClassification) => {
    switch (classification) {
      case 'brilliant':
        return {
          label: 'Brilliant !!',
          bgColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: <Award className="w-3.5 h-3.5 text-purple-400" />,
        };
      case 'best':
        return {
          label: 'Best Move ★',
          bgColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'excellent':
        return {
          label: 'Excellent',
          bgColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          icon: <CheckCircle className="w-3.5 h-3.5 text-teal-400" />,
        };
      case 'good':
        return {
          label: 'Good',
          bgColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: <CheckCircle className="w-3.5 h-3.5 text-blue-400" />,
        };
      case 'inaccuracy':
        return {
          label: 'Inaccuracy ?!',
          bgColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'mistake':
        return {
          label: 'Mistake ?',
          bgColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />,
        };
      case 'blunder':
        return {
          label: 'Blunder ??',
          bgColor: 'bg-rose-500/25 text-rose-300 border-rose-500/50',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
        };
      default:
        return {
          label: 'Good',
          bgColor: 'bg-slate-700/40 text-slate-300 border-slate-600',
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const evalFormatted = (currentEval / 100).toFixed(1);
  const evalDisplay = currentEval > 0 ? `+${evalFormatted}` : evalFormatted;

  // Translated coaching explanation in chosen Indian language
  const localizedExplanation = lastEvaluatedMove
    ? getTranslatedExplanation(
        language,
        lastEvaluatedMove.classification,
        lastEvaluatedMove.san,
        lastEvaluatedMove.bestMoveSan
      )
    : '';

  // In MATCH MODE: clean and minimal status strip
  if (gameMode === 'match') {
    return (
      <div className="w-full max-w-xl mx-auto px-2 py-0.5">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">{gameStatus || 'Your Turn'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Eval:</span>
            <span
              className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                currentEval > 50
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : currentEval < -50
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {evalDisplay}
            </span>
          </div>
        </div>

        {/* Show Hint if user clicked Hint */}
        {coachHint && isPlayerTurn && (
          <div className="mt-1.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 flex items-start gap-2 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-amber-300">Coach Hint: </span>
              {coachHint}
            </div>
            <button
              onClick={() => replayVoice(coachHint)}
              className="text-amber-400 hover:text-amber-200 p-0.5"
              title="Speak Hint"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // In COACH MODE: comprehensive move feedback
  return (
    <div className="w-full max-w-xl mx-auto px-2 py-1">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-md backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-300">Coach Analysis</span>
            <span className="text-[11px] text-slate-400">• {gameStatus}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Eval:</span>
            <span
              className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                currentEval > 50
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : currentEval < -50
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {evalDisplay}
            </span>
          </div>
        </div>

        {/* Hint alert if active */}
        {coachHint && isPlayerTurn && (
          <div className="mb-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 flex items-start gap-2 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-amber-300">Dr. Drona: </span>
              {coachHint}
            </div>
            <button
              onClick={() => replayVoice(coachHint)}
              className="text-amber-400 hover:text-amber-200 p-0.5"
              title="Speak"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Evaluated Move */}
        {lastEvaluatedMove ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-100 text-xs">
                  {lastEvaluatedMove.moveNumber}. {lastEvaluatedMove.san}
                </span>
                {(() => {
                  const badge = getClassificationBadge(lastEvaluatedMove.classification);
                  return (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bgColor}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              <button
                onClick={() => replayVoice(localizedExplanation)}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700"
                title="Speak explanation"
              >
                <Volume2 className="w-3 h-3" />
                <span>Voice</span>
              </button>
            </div>

            {/* Coach explanation text (Translated into the Indian language) */}
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800/70 mb-1.5">
              {localizedExplanation}
            </p>

            {/* Optional Better alternative move button */}
            {(lastEvaluatedMove.classification === 'inaccuracy' ||
              lastEvaluatedMove.classification === 'mistake' ||
              lastEvaluatedMove.classification === 'blunder') && (
              <div className="flex items-center justify-between bg-slate-800/40 px-2 py-1.5 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-400 text-[11px]">Better Move:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {lastEvaluatedMove.bestMoveSan}
                  </span>
                </div>

                <button
                  onClick={onShowAlternative}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                    isShowingAlternative
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{isShowingAlternative ? 'Hide Move' : 'Show Move'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-1 text-slate-400 text-xs">
            <span className="text-slate-300 font-medium">Ready for your move.</span>
            <span className="text-slate-500 text-[11px] block mt-0.5">Control the center and develop pieces.</span>
          </div>
        )}
      </div>
    </div>
  );
};
