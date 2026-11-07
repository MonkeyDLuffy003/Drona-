import React from 'react';
import { EvaluatedMove } from '../types/chess';
import { Sparkles, Lightbulb, Volume2, VolumeX, ArrowRight, Eye, ShieldAlert, Award } from 'lucide-react';
import { voiceCoach } from '../audio/voiceCoach';
import { SupportedLanguage, getTranslatedExplanation } from '../i18n/languages';

interface DronaSpeechCardProps {
  lastEvaluatedMove: EvaluatedMove | null;
  coachHint: string | null;
  onAskHint: () => void;
  onToggleAlternative: () => void;
  isShowingAlternative: boolean;
  isPlayerTurn: boolean;
  isAiThinking: boolean;
  language: SupportedLanguage;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
}

export const DronaSpeechCard: React.FC<DronaSpeechCardProps> = ({
  lastEvaluatedMove,
  coachHint,
  onAskHint,
  onToggleAlternative,
  isShowingAlternative,
  isPlayerTurn,
  isAiThinking,
  language,
  voiceEnabled = true,
  onToggleVoice,
}) => {
  // Classification badge colors
  const classificationStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
    brilliant: { label: 'Brilliant !!', bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/40' },
    best: { label: 'Best Move ⭐', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40' },
    excellent: { label: 'Excellent', bg: 'bg-emerald-500/15', text: 'text-emerald-200', border: 'border-emerald-500/30' },
    good: { label: 'Good', bg: 'bg-slate-700/40', text: 'text-slate-200', border: 'border-slate-600/40' },
    inaccuracy: { label: 'Inaccuracy ?!', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
    mistake: { label: 'Mistake ?', bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
    blunder: { label: 'Blunder ??', bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
    book: { label: 'Book Move 📖', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/40' },
  };

  const currentClass = lastEvaluatedMove ? classificationStyles[lastEvaluatedMove.classification] : null;

  // Spoken text to speak or display
  let spokenText = coachHint;
  if (!spokenText && lastEvaluatedMove) {
    spokenText = getTranslatedExplanation(
      language,
      lastEvaluatedMove.classification,
      lastEvaluatedMove.san,
      lastEvaluatedMove.tacticalTheme
    );
  }

  const handleSpeak = () => {
    if (spokenText) {
      voiceCoach.speak(spokenText, 'urgent');
    }
  };

  const hasAlternative =
    lastEvaluatedMove &&
    ['inaccuracy', 'mistake', 'blunder'].includes(lastEvaluatedMove.classification) &&
    lastEvaluatedMove.bestMoveSan;

  return (
    <div className="w-full max-w-xl mx-auto px-1">
      <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex items-center justify-between gap-2 text-xs">
        {/* Left: Avatar + Badge + 1-line text */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative shrink-0 w-8 h-8 rounded-full overflow-hidden border border-purple-500/60 shadow-sm shadow-purple-900/40">
            <img
              src="/assets/aistudio/file_0000000081148208b0396e1156607bc3_4c785c10.png"
              alt="Drona"
              className="w-full h-full object-cover object-[50%_12%]"
            />
            {isAiThinking && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-bold text-[11px] text-amber-300 shrink-0">Dr. Drona</span>
              {currentClass && (
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${currentClass.bg} ${currentClass.text} ${currentClass.border} shrink-0`}
                >
                  {currentClass.label}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-300 truncate font-medium">
              {isAiThinking
                ? 'Calculating optimal defensive counter...'
                : spokenText || (isPlayerTurn ? 'Your turn. Calculate candidate moves.' : 'Waiting for AI move...')}
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {onToggleVoice !== undefined && (
            <button
              onClick={onToggleVoice}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                voiceEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={voiceEnabled ? 'Voice Mode: ON (Tap to mute)' : 'Voice Mode: OFF (Tap to enable voice)'}
            >
              {voiceEnabled ? <Volume2 className="w-3 h-3 text-amber-400" /> : <VolumeX className="w-3 h-3 text-slate-400" />}
              <span>{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
            </button>
          )}

          {spokenText && (
            <button
              onClick={handleSpeak}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
              title="Speak explanation"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}

          {hasAlternative && (
            <button
              onClick={onToggleAlternative}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                isShowingAlternative
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-amber-200 border-slate-700 hover:border-amber-500/40'
              }`}
              title="Show best engine alternative move"
            >
              <Eye className="w-3 h-3" />
              <span>{isShowingAlternative ? 'Hide' : 'Better'}</span>
            </button>
          )}

          {isPlayerTurn && !isAiThinking && (
            <button
              onClick={onAskHint}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors"
              title="Ask Dr. Drona for a hint"
            >
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Hint</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
