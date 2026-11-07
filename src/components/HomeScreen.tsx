import React, { useState } from 'react';
import { 
  Play, 
  Menu, 
  Settings, 
  BarChart2, 
  ChevronRight, 
  Volume2, 
  Award, 
  X,
  Sparkles,
  Trophy,
  CheckCircle2,
  Shield,
  Zap,
  Flame
} from 'lucide-react';
import { DifficultyLevel, PieceColor } from '../types/chess';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/languages';
import { getPlayerStats } from '../storage/gameStorage';
import { voiceCoach } from '../audio/voiceCoach';
import { soundEffects } from '../audio/soundEffects';

interface HomeScreenProps {
  onStartGame: (options?: { difficulty?: DifficultyLevel; color?: PieceColor; mode?: 'match' | 'coach' | 'two-player' }) => void;
  onNavigateTab: (tab: 'play' | 'puzzles' | 'train' | 'stats' | 'openings' | 'endgames') => void;
  onOpenSettings: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  currentDifficulty: DifficultyLevel;
}

export const DRONA_HERO_BG = '/assets/aistudio/file_00000000d6448208aac02023dde1bb1f_8a4a040d.png';
export const DRONA_CHAR_IMG = '/assets/aistudio/file_0000000081148208b0396e1156607bc3_4c785c10.png';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onNavigateTab,
  onOpenSettings,
  language,
  onLanguageChange,
  currentDifficulty,
}) => {
  const stats = getPlayerStats();
  const [showAchievements, setShowAchievements] = useState(false);
  const [showGameSetupModal, setShowGameSetupModal] = useState(false);
  const [setupModalTitle, setSetupModalTitle] = useState('Play vs Drona AI');
  const [selectedColor, setSelectedColor] = useState<'w' | 'b' | 'random'>('w');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(currentDifficulty);
  const [selectedMode, setSelectedMode] = useState<'match' | 'coach'>('coach');
  const [isSpeakingWelcome, setIsSpeakingWelcome] = useState(false);

  const playerRating = 1250 + stats.wins * 15 - stats.losses * 10;

  const handleOpenGameSetup = (title: string, defaultMode: 'match' | 'coach' = 'coach') => {
    setSetupModalTitle(title);
    setSelectedMode(defaultMode);
    setShowGameSetupModal(true);
  };

  const handleLaunchMatch = () => {
    const finalColor: PieceColor =
      selectedColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : selectedColor;
    onStartGame({
      difficulty: selectedDifficulty,
      color: finalColor,
      mode: selectedMode,
    });
    setShowGameSetupModal(false);
  };

  const handleSpeakCoachGreeting = () => {
    setIsSpeakingWelcome(true);
    soundEffects.playVoiceChime();
    const greeting = language === 'en' 
      ? "Good move, Teja! Let's plan your next move on the chessboard."
      : TRANSLATIONS[language]?.welcomeVoice || "Good move, Teja! Let's plan your next move.";
    voiceCoach.speak(greeting, 'urgent');
    setTimeout(() => setIsSpeakingWelcome(false), 3000);
  };

  const ACHIEVEMENTS = [
    { id: 'first_win', title: 'First Blood', desc: 'Win your first game against Drona AI', unlocked: stats.wins >= 1, icon: '⚔️' },
    { id: 'tactics_5', title: 'Tactical Mind', desc: 'Solve tactical chess puzzles', unlocked: true, icon: '⚡' },
    { id: 'openings_pro', title: 'Repertoire Master', desc: 'Execute standard theory moves', unlocked: stats.totalGames >= 2, icon: '📖' },
    { id: 'accuracy_80', title: 'Precision Master', desc: 'Achieve 80%+ engine accuracy in a match', unlocked: stats.averageAccuracy >= 80, icon: '🎯' },
    { id: 'grandmaster', title: 'Drona\'s Disciple', desc: 'Reach 1300+ player rating', unlocked: playerRating >= 1300, icon: '👑' },
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#060814] text-slate-100 flex flex-col justify-between pb-6 select-none relative overflow-x-hidden">
      {/* 1. TOP STATUS BAR */}
      <div className="w-full px-4 pt-3 pb-2 flex items-center justify-between z-20">
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800/80 transition-colors"
          title="Menu"
        >
          <Menu className="w-5 h-5 text-slate-200" />
        </button>

        {/* Right Stats: Rating with Crown, Analytics, Settings */}
        <div className="flex items-center gap-2">
          {/* Player Rating Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shadow-sm">
            <span className="text-amber-400 text-sm">👑</span>
            <span>{playerRating}</span>
          </div>

          <button
            onClick={() => onNavigateTab('stats')}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80 transition-colors"
            title="Statistics"
          >
            <BarChart2 className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* 2. HERO CHARACTER SECTION (Drona in luxury chess study + Knight aura + Dialogue) */}
      <div className="relative w-full px-3 pt-1 pb-3 flex flex-col items-center">
        {/* Glow ambient halos */}
        <div className="absolute top-2 left-1/4 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-44 h-44 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full grid grid-cols-12 items-center gap-2">
          {/* Left Column: Handsome Drona Character */}
          <div className="col-span-5 relative flex items-center justify-center">
            {/* Soft purple backlight */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-purple-600/20 to-transparent rounded-full blur-xl" />
            
            <div className="relative w-36 h-48 sm:w-40 sm:h-52 overflow-hidden rounded-2xl">
              <img
                src={DRONA_CHAR_IMG}
                alt="Drona AI"
                className="w-full h-full object-cover object-[50%_12%] drop-shadow-[0_10px_20px_rgba(147,51,234,0.35)] transition-transform duration-300 hover:scale-105"
              />
              {/* Neon border highlight */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-purple-500/40 pointer-events-none" />
            </div>
          </div>

          {/* Right Column: Golden Knight Emblem, Title, Coach Dialogue */}
          <div className="col-span-7 flex flex-col items-center sm:items-start text-center sm:text-left pr-1">
            {/* Golden Knight with Cosmic Neon Aura Rings */}
            <div className="relative flex items-center justify-center mb-1">
              <div className="w-12 h-12 rounded-full border-2 border-purple-500/60 flex items-center justify-center bg-purple-950/60 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">♞</span>
              </div>
              <div className="absolute -inset-1 rounded-full border border-purple-400/30 animate-pulse pointer-events-none" />
            </div>

            {/* 3D Metallic Title: DRONA */}
            <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)] leading-none mb-1 font-serif">
              DRONA
            </h1>
            <p className="text-[11px] font-semibold tracking-wide text-purple-200/90 italic mb-2">
              Your Personal Chess Coach
            </p>

            {/* Drona Speech Glass Bubble */}
            <div 
              onClick={handleSpeakCoachGreeting}
              className={`w-full p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/50 backdrop-blur-md shadow-lg shadow-purple-950/50 cursor-pointer transition-all ${
                isSpeakingWelcome ? 'ring-2 ring-purple-400 bg-purple-900/60' : 'hover:border-purple-400'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <p className="text-[11px] text-slate-100 font-medium leading-tight italic text-left">
                  "Good move, Teja!<br />
                  <span className="text-purple-200 font-normal">Let's plan your next move."</span>
                </p>
                <button
                  className="p-1 rounded-lg bg-purple-500/20 text-purple-300 hover:text-white shrink-0"
                  title="Speak"
                >
                  <Volume2 className="w-3.5 h-3.5 text-purple-300" />
                </button>
              </div>
              <span className="text-[9px] font-bold text-purple-400 block text-right tracking-wider">
                — Drona
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN INTERACTIVE GAME MODE CARDS GRID (Exact 2x2 structure from Reference Image 1) */}
      <div className="w-full px-3 flex flex-col gap-2.5 z-10">
        {/* Row 1: Big Featured Cards (Play Chess & Play vs AI) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Play Chess (Golden Radiant Theme) */}
          <div
            onClick={() => handleOpenGameSetup('Play Chess', 'match')}
            className="group relative p-3 rounded-2xl bg-gradient-to-b from-[#3a280c] via-[#1a140d] to-[#0c0a08] border-2 border-amber-500/70 hover:border-amber-400 cursor-pointer transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-[0.98] flex flex-col justify-between min-h-[115px] overflow-hidden"
          >
            {/* Golden radial background flare */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              {/* Golden King Icon on mini chess grid */}
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xl shadow-md">
                ♚
              </div>
              {/* Circular Play Button */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/50 group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950 ml-0.5" />
              </div>
            </div>

            <div className="relative z-10 mt-2">
              <h3 className="font-black text-sm text-amber-200 group-hover:text-amber-100 transition-colors">
                Play Chess
              </h3>
              <p className="text-[10px] text-amber-400/80 font-medium">
                Start a new game
              </p>
            </div>
          </div>

          {/* Card 2: Play vs AI (Cyber Blue Robot Theme) */}
          <div
            onClick={() => handleOpenGameSetup('Play vs Drona AI', 'coach')}
            className="group relative p-3 rounded-2xl bg-gradient-to-b from-[#0a1a36] via-[#091122] to-[#060814] border-2 border-blue-500/60 hover:border-blue-400 cursor-pointer transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-[0.98] flex flex-col justify-between min-h-[115px] overflow-hidden"
          >
            {/* Blue radial glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              {/* Robot Avatar Icon */}
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 text-xl shadow-md">
                🤖
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ChevronRight className="w-3.5 h-3.5 text-blue-300" />
              </div>
            </div>

            <div className="relative z-10 mt-2">
              <h3 className="font-black text-sm text-blue-200 group-hover:text-blue-100 transition-colors">
                Play vs AI
              </h3>
              <p className="text-[10px] text-blue-300/80 font-medium">
                {currentDifficulty} (~{currentDifficulty === 'Beginner' ? '500' : currentDifficulty === 'Master' ? '2200+' : '1300'})
              </p>
            </div>
          </div>
        </div>

        {/* Row 2: Two Player & Chess Puzzles */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Two Player (Two golden pawns) */}
          <div
            onClick={() => onStartGame({ mode: 'two-player' })}
            className="group p-2.5 rounded-2xl bg-gradient-to-r from-[#0d1633] to-[#090e24] border border-blue-600/40 hover:border-blue-400/80 cursor-pointer transition-all shadow-md active:scale-[0.98] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 text-base shrink-0">
                ♟♟
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 group-hover:text-amber-200 transition-colors">
                  Two Player
                </h4>
                <p className="text-[10px] text-slate-400">Play with a friend</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Chess Puzzles (Golden puzzle piece) */}
          <div
            onClick={() => onNavigateTab('puzzles')}
            className="group p-2.5 rounded-2xl bg-gradient-to-r from-[#0d1633] to-[#090e24] border border-blue-600/40 hover:border-blue-400/80 cursor-pointer transition-all shadow-md active:scale-[0.98] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 text-base shrink-0">
                🧩
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 group-hover:text-amber-200 transition-colors">
                  Chess Puzzles
                </h4>
                <p className="text-[10px] text-slate-400">Train your mind</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Row 3: Training Arena & Game Analysis */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Training Arena (Target icon) */}
          <div
            onClick={() => onNavigateTab('train')}
            className="group p-2.5 rounded-2xl bg-gradient-to-r from-[#0d1633] to-[#090e24] border border-blue-600/40 hover:border-blue-400/80 cursor-pointer transition-all shadow-md active:scale-[0.98] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 text-base shrink-0">
                🎯
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 group-hover:text-amber-200 transition-colors">
                  Training Arena
                </h4>
                <p className="text-[10px] text-slate-400">Improve your skills</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Game Analysis (Magnifier over chess board) */}
          <div
            onClick={() => onNavigateTab('stats')}
            className="group p-2.5 rounded-2xl bg-gradient-to-r from-[#0d1633] to-[#090e24] border border-blue-600/40 hover:border-blue-400/80 cursor-pointer transition-all shadow-md active:scale-[0.98] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 text-base shrink-0">
                🔍
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 group-hover:text-amber-200 transition-colors">
                  Game Analysis
                </h4>
                <p className="text-[10px] text-slate-400">Review your games</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Row 4: My Progress & Achievements */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* My Progress (Bar chart) */}
          <div
            onClick={() => onNavigateTab('stats')}
            className="group p-2.5 rounded-2xl bg-gradient-to-r from-[#0d1633] to-[#090e24] border border-blue-600/40 hover:border-blue-400/80 cursor-pointer transition-all shadow-md active:scale-[0.98] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 text-base shrink-0">
                📊
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 group-hover:text-amber-200 transition-colors">
                  My Progress
                </h4>
                <p className="text-[10px] text-slate-400">Track your growth</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Achievements (Golden Trophy Cup) */}
          <div
            onClick={() => setShowAchievements(true)}
            className="group p-2.5 rounded-2xl bg-gradient-to-r from-[#0d1633] to-[#090e24] border border-blue-600/40 hover:border-blue-400/80 cursor-pointer transition-all shadow-md active:scale-[0.98] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 text-base shrink-0">
                🏆
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 group-hover:text-amber-200 transition-colors">
                  Achievements
                </h4>
                <p className="text-[10px] text-slate-400">Unlock milestones</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 4.5 DOWNLOAD ANDROID APK BADGE & ACTION */}
      <div className="w-full px-3 pt-2 pb-0">
        <a
          href="https://github.com/MonkeyDLuffy003/Drona-/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 hover:border-emerald-400/80 flex items-center justify-between transition-all group shadow-md active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-base text-emerald-400 shrink-0">
              📱
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span>Download Android APK</span>
                <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.2 rounded font-mono font-bold text-emerald-300 border border-emerald-500/30">
                  v1.0.0
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Download native APK from GitHub Releases</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0">
            <span>Get APK</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </a>
      </div>

      {/* 5. BOTTOM ORNAMENT RIBBON (Matching Reference Image 1) */}
      <div className="w-full px-4 pt-3 pb-1">
        <div className="relative flex items-center justify-center py-2">
          {/* Subtle gold line */}
          <div className="absolute inset-x-4 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          
          {/* Golden Badge */}
          <div className="relative px-4 py-1 rounded-full bg-[#060814] border border-amber-500/40 text-amber-300 font-serif text-[11px] font-semibold tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-950/30">
            <span className="text-amber-400">👑</span>
            <span>Play • Learn • Think • Improve • Master</span>
          </div>
        </div>
      </div>

      {/* MODAL: Game Setup & Side Selector */}
      {showGameSetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-base">
                  ⚔️
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-100">
                    {setupModalTitle}
                  </h3>
                  <p className="text-[10px] text-amber-400 font-medium">
                    Configure your game match
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGameSetupModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. CHOOSE SIDE (WHITE / BLACK / RANDOM) */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Choose Your Pieces
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Play as White */}
                <button
                  type="button"
                  onClick={() => setSelectedColor('w')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    selectedColor === 'w'
                      ? 'bg-amber-500/25 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]">♔</span>
                  <span className={`text-xs font-bold mt-1 ${selectedColor === 'w' ? 'text-amber-200' : 'text-slate-300'}`}>
                    White
                  </span>
                  <span className="text-[9px] text-slate-400 text-center leading-tight">
                    Move 1st
                  </span>
                </button>

                {/* Play as Black */}
                <button
                  type="button"
                  onClick={() => setSelectedColor('b')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    selectedColor === 'b'
                      ? 'bg-purple-500/25 border-purple-400 shadow-md shadow-purple-500/20 ring-1 ring-purple-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl drop-shadow-[0_2px_4px_rgba(168,85,247,0.4)]">♚</span>
                  <span className={`text-xs font-bold mt-1 ${selectedColor === 'b' ? 'text-purple-200' : 'text-slate-300'}`}>
                    Black
                  </span>
                  <span className="text-[9px] text-purple-300/80 text-center leading-tight font-medium">
                    AI starts
                  </span>
                </button>

                {/* Random Side */}
                <button
                  type="button"
                  onClick={() => setSelectedColor('random')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    selectedColor === 'random'
                      ? 'bg-blue-500/25 border-blue-400 shadow-md shadow-blue-500/20 ring-1 ring-blue-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">🎲</span>
                  <span className={`text-xs font-bold mt-1 ${selectedColor === 'random' ? 'text-blue-200' : 'text-slate-300'}`}>
                    Random
                  </span>
                  <span className="text-[9px] text-slate-400 text-center leading-tight">
                    50 / 50
                  </span>
                </button>
              </div>
            </div>

            {/* 2. CHOOSE AI DIFFICULTY */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Drona AI Level
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert', 'Master'] as DifficultyLevel[]).map((lvl) => {
                  const isSelected = selectedDifficulty === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedDifficulty(lvl)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{lvl}</div>
                      <div className="text-[9px] font-mono text-slate-400">
                        {lvl === 'Beginner' && '~500 Elo'}
                        {lvl === 'Easy' && '~900 Elo'}
                        {lvl === 'Intermediate' && '~1300 Elo'}
                        {lvl === 'Advanced' && '~1600 Elo'}
                        {lvl === 'Expert' && '~1900 Elo'}
                        {lvl === 'Master' && '~2200+ Elo'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. COACH MODE TOGGLE */}
            <div className="mb-4 p-2.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Drona Live Guidance</div>
                <div className="text-[10px] text-slate-400">Tactical hints & post-move voice feedback</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMode((prev) => (prev === 'coach' ? 'match' : 'coach'))}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedMode === 'coach'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {selectedMode === 'coach' ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* 4. LAUNCH GAME ACTION BUTTON */}
            <button
              type="button"
              onClick={handleLaunchMatch}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>
                {selectedColor === 'b'
                  ? 'Start Match as Black (AI Moves First)'
                  : selectedColor === 'w'
                  ? 'Start Match as White (You Move First)'
                  : 'Start Match (Random Side)'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Achievements */}
      {showAchievements && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-sm text-amber-200 flex items-center gap-1.5">
                <span>🏆</span> Milestones & Achievements
              </h3>
              <button
                onClick={() => setShowAchievements(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                    ach.unlocked
                      ? 'bg-amber-500/10 border-amber-500/40 text-slate-100'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                  }`}
                >
                  <span className="text-xl shrink-0">{ach.icon}</span>
                  <div className="flex-1">
                    <h5 className="font-bold text-xs">{ach.title}</h5>
                    <p className="text-[10px]">{ach.desc}</p>
                  </div>
                  {ach.unlocked && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
