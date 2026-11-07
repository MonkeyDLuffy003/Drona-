import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Globe, Swords, GraduationCap, Undo2, SlidersHorizontal, HelpCircle } from 'lucide-react';
import { voiceCoach, CoachPersona } from '../audio/voiceCoach';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/languages';
import { DronaPortrait } from './DronaPortrait';

interface VoiceAgentBarProps {
  onAskHint: () => void;
  onExplainPosition: () => void;
  onUndo: () => void;
  onOpenSettings?: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  gameMode: 'match' | 'coach';
  onGameModeChange: (mode: 'match' | 'coach') => void;
  onVoiceMoveCommand?: (command: string) => void;
  persona?: CoachPersona;
  onPersonaChange?: (p: CoachPersona) => void;
  isAiThinking?: boolean;
  isPlayerTurn?: boolean;
}

export const VoiceAgentBar: React.FC<VoiceAgentBarProps> = ({
  onAskHint,
  onExplainPosition,
  onUndo,
  onOpenSettings,
  language,
  onLanguageChange,
  gameMode,
  onGameModeChange,
  isAiThinking = false,
  isPlayerTurn = true,
}) => {
  const [voiceStatus, setVoiceStatus] = useState({
    isSpeaking: false,
    isListening: false,
    text: '',
    amplitude: 0,
    language,
  });
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    const unsub = voiceCoach.subscribeStatus((status) => {
      setVoiceStatus(status);
    });
    return unsub;
  }, []);

  const toggleVoiceMute = () => {
    const next = !voiceMuted;
    setVoiceMuted(next);
    voiceCoach.setVoiceEnabled(!next);
  };

  const toggleMicListening = () => {
    voiceCoach.toggleListening();
  };

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    onLanguageChange(lang);
    voiceCoach.setLanguage(lang);
    setIsLangOpen(false);

    // Dr. Drona speaks warm greeting in the selected Indian language with authoritative voice
    const welcome = TRANSLATIONS[lang]?.welcomeVoice || TRANSLATIONS.en.welcomeVoice;
    voiceCoach.speak(welcome, 'urgent');
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="w-full max-w-xl mx-auto px-2 pt-1 pb-1">
      {/* Sleek Master Coach Bar */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-amber-500/25 p-2.5 shadow-xl backdrop-blur-md">
        
        {/* Top Header: Coach Portrait + Title + Mode Switcher + Voice Language */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Left: Master Drona Portrait + Equalizer */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <DronaPortrait
                isSpeaking={voiceStatus.isSpeaking}
                isListening={voiceStatus.isListening}
                className="w-11 h-13 rounded-xl border border-amber-500/40 shadow-md"
              />
              {voiceStatus.isSpeaking && (
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-amber-200 text-sm tracking-wide truncate">
                  Dr. Drona
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {voiceStatus.isSpeaking
                    ? 'Speaking...'
                    : voiceStatus.isListening
                    ? 'Listening'
                    : isAiThinking
                    ? 'Thinking'
                    : 'AI Coach'}
                </span>
              </div>

              {/* Subtitle / Mode text */}
              <p className="text-[10px] text-slate-400 truncate">
                {gameMode === 'match'
                  ? 'Match Mode • Focus'
                  : 'Coach Mode • Guidance'}
              </p>

              {/* Voice equalizer waveform */}
              <div className="flex items-end gap-0.5 h-2 mt-0.5">
                {[0.4, 0.9, 1.4, 1.1, 0.7, 0.3].map((factor, idx) => (
                  <div
                    key={idx}
                    className={`w-0.5 rounded-full transition-all duration-100 ${
                      voiceStatus.isSpeaking
                        ? 'bg-amber-400'
                        : voiceStatus.isListening
                        ? 'bg-emerald-400'
                        : 'bg-slate-700'
                    }`}
                    style={{
                      height: `${Math.max(2, Math.min(8, (voiceStatus.amplitude * factor + 0.1) * 8))}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Mode Switcher + Voice Language Selector */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Mode Toggle: Match Mode vs Coach Mode */}
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => onGameModeChange('match')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                  gameMode === 'match'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Normal Playing Mode: Clean board, tile highlights only"
              >
                <Swords className="w-3 h-3" />
                <span>Match</span>
              </button>
              <button
                onClick={() => onGameModeChange('coach')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                  gameMode === 'coach'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Learning Mode: Dr. Drona provides real-time coaching"
              >
                <GraduationCap className="w-3 h-3" />
                <span>Coach</span>
              </button>
            </div>

            {/* Voice Language Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-amber-500/30 text-[11px] font-medium transition-colors"
                title="Select Voice Language: Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Odia, English"
              >
                <Globe className="w-3 h-3 text-amber-400" />
                <span className="text-amber-300 font-semibold">{currentLangMeta.nativeName}</span>
                <span className="text-[9px] text-slate-400">Voice</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-amber-500/50 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                  <div className="px-3 py-1 text-[9px] font-bold uppercase text-slate-400 tracking-wider border-b border-slate-800">
                    Voice Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleSelectLanguage(l.code)}
                      className={`w-full text-left px-3 py-1 text-xs font-medium flex items-center justify-between hover:bg-amber-500/20 hover:text-amber-200 transition-colors ${
                        language === l.code
                          ? 'bg-amber-500/15 text-amber-300 font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="text-amber-200">{l.nativeName}</span>
                      <span className="text-[10px] text-slate-400">{l.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Row: Quick Master Controls [ ? Hint ] [ ↶ Undo ] [ Mic ] [ Mute ] [ ⚙ ] */}
        <div className="flex items-center justify-between gap-1.5 pt-2 mt-1.5 border-t border-slate-800/80">
          {/* Main 3 Controls (Matching Reference: [ ? Hint ] [ ↶ Undo ] [ ⚙ ]) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onAskHint}
              disabled={isAiThinking || !isPlayerTurn}
              className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 disabled:opacity-40 transition-colors shadow-sm"
              title="Ask Dr. Drona for a Hint (?)"
              aria-label="Hint"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Hint</span>
            </button>

            <button
              onClick={onUndo}
              disabled={isAiThinking}
              className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-750 text-slate-300 border border-slate-700/80 disabled:opacity-40 transition-colors"
              title="Undo move (↶)"
              aria-label="Undo"
            >
              <Undo2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Undo</span>
            </button>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 border border-slate-700/80 transition-colors"
                title="Game Settings"
                aria-label="Settings"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>

          {/* Voice Controls: Mic & Speaker */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMicListening}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all border text-xs font-semibold ${
                voiceStatus.isListening
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md animate-pulse font-bold'
                  : 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 border-slate-700/80'
              }`}
              title={voiceStatus.isListening ? 'Listening (Click to stop)' : 'Speak move or command'}
              aria-label="Toggle voice mic"
            >
              {voiceStatus.isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{voiceStatus.isListening ? 'Active' : 'Mic'}</span>
            </button>

            <button
              onClick={toggleVoiceMute}
              className={`p-1.5 rounded-xl transition-colors border ${
                voiceMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 border-slate-700/80'
              }`}
              title={voiceMuted ? 'Unmute Dr. Drona Voice' : 'Mute Voice'}
              aria-label="Toggle voice mute"
            >
              {voiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Live spoken coach speech quote in chosen language */}
        {voiceStatus.text && (
          <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5 text-xs text-amber-100 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
            <span className="text-amber-400 font-bold text-[11px] shrink-0">
              Dr. Drona ({currentLangMeta.name}):
            </span>
            <span className="italic leading-snug">"{voiceStatus.text}"</span>
          </div>
        )}
      </div>
    </div>
  );
};
