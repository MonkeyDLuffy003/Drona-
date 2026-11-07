import React from 'react';
import { CoachPersona, voiceCoach } from '../audio/voiceCoach';
import { soundEffects } from '../audio/soundEffects';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/languages';
import { Settings, X, Volume2, VolumeX, Palette, UserCheck, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardTheme: 'classic' | 'wood' | 'midnight' | 'emerald' | 'tournament';
  onBoardThemeChange: (theme: 'classic' | 'wood' | 'midnight' | 'emerald' | 'tournament') => void;
  persona: CoachPersona;
  onPersonaChange: (p: CoachPersona) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  soundMuted: boolean;
  onSoundMuteToggle: () => void;
  voiceEnabled: boolean;
  onVoiceToggle: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  boardTheme,
  onBoardThemeChange,
  persona,
  onPersonaChange,
  language,
  onLanguageChange,
  soundMuted,
  onSoundMuteToggle,
  voiceEnabled,
  onVoiceToggle,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-amber-200 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          {t.settings}
        </h3>

        {/* Indian Language Selector */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-950/70 border border-purple-500/30">
          <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-400" />
              Voice & Commentary Language
            </span>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              8 Languages
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {SUPPORTED_LANGUAGES.map((l) => {
              const isSelected = language === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => {
                    onLanguageChange(l.code);
                    voiceCoach.setLanguage(l.code);
                    const welcome = TRANSLATIONS[l.code]?.welcomeVoice || TRANSLATIONS.en.welcomeVoice;
                    voiceCoach.speak(welcome, 'urgent');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/15 border-amber-400 text-amber-200 font-extrabold shadow-md shadow-amber-500/20 scale-[1.02]'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="font-extrabold text-sm">{l.nativeName}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{l.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Male AI Coach Persona */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-amber-400" />
            Male AI Guru Persona
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { id: 'drona' as CoachPersona, name: 'Guru Drona', desc: 'Wise & strategic Guru' },
              { id: 'acharya' as CoachPersona, name: 'Acharya', desc: 'Tactical Calculation' },
              { id: 'guru' as CoachPersona, name: 'Grandmaster', desc: 'Solid & Resilient' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onPersonaChange(p.id);
                  voiceCoach.setPersona(p.id);
                  voiceCoach.speak(`I am ${p.name}. Ready for chess strategy.`, 'urgent');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  persona === p.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-slate-200">{p.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Board Theme */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-amber-400" />
            Chessboard Theme
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'classic' as const, name: 'Classic Parchment', colors: 'from-[#f4ebd0] to-[#b58863]' },
              { id: 'wood' as const, name: 'Warm Wood', colors: 'from-[#e2c19a] to-[#986b41]' },
              { id: 'midnight' as const, name: 'Midnight Obsidian', colors: 'from-slate-700 to-slate-900' },
              { id: 'emerald' as const, name: 'Emerald Green', colors: 'from-[#e8edcc] to-[#5c8b57]' },
              { id: 'tournament' as const, name: 'FIDE Tournament', colors: 'from-[#f0d9b5] to-[#b58863]' },
            ].map((th) => (
              <button
                key={th.id}
                onClick={() => onBoardThemeChange(th.id)}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  boardTheme === th.id
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${th.colors} border border-slate-700 shrink-0`} />
                <span className="text-slate-200">{th.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-slate-200 block">Procedural Sound Effects</span>
              <span className="text-[11px] text-slate-400">Moves, captures, checks, and alert chimes</span>
            </div>
            <button
              onClick={() => {
                onSoundMuteToggle();
                soundEffects.setMuted(!soundMuted);
              }}
              className={`p-2 rounded-xl border ${
                !soundMuted
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {!soundMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-slate-200 block">Guru Drona Male Voice Audio</span>
              <span className="text-[11px] text-slate-400">Authoritative male voice speech</span>
            </div>
            <button
              onClick={() => {
                onVoiceToggle();
                voiceCoach.setVoiceEnabled(!voiceEnabled);
              }}
              className={`p-2 rounded-xl border ${
                voiceEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
