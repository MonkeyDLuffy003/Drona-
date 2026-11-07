import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { PieceColor, DifficultyLevel, EvaluatedMove, GameSummary } from './types/chess';
import { ChessEngine, evaluateBoard } from './engine/chessEngine';
import { evaluatePlayedMove, calculateGameAccuracy } from './engine/evaluator';
import { identifyOpening } from './openings/openingBook';
import { recordCompletedGame, getPlayerStats } from './storage/gameStorage';
import { soundEffects } from './audio/soundEffects';
import { voiceCoach, CoachPersona } from './audio/voiceCoach';
import { SupportedLanguage, TRANSLATIONS, getTranslatedExplanation, getTranslatedHint, SUPPORTED_LANGUAGES } from './i18n/languages';

import { Chessboard } from './components/Chessboard';
import { HomeScreen } from './components/HomeScreen';
import { PuzzleArena } from './components/PuzzleArena';
import { CapturedPieces } from './components/CapturedPieces';
import { DronaSpeechCard } from './components/DronaSpeechCard';
import { PostGameModal } from './components/PostGameModal';
import { OpeningsView } from './components/OpeningsView';
import { EndgameView } from './components/EndgameView';
import { TrainingView } from './components/TrainingView';
import { DashboardView } from './components/DashboardView';
import { SettingsModal } from './components/SettingsModal';

import { 
  Home,
  Play, 
  BookOpen, 
  Compass, 
  Target, 
  BarChart3, 
  RotateCcw, 
  RefreshCw, 
  Sliders, 
  Eye, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ArrowLeftRight,
  Flag,
  Award,
  Zap,
  Mic,
  MicOff,
  ChevronLeft,
  X
} from 'lucide-react';

export default function App() {
  // Navigation tabs: 'home' | 'play' | 'puzzles' | 'train' | 'stats' | 'openings' | 'endgames'
  const [currentTab, setCurrentTab] = useState<'home' | 'play' | 'puzzles' | 'train' | 'stats' | 'openings' | 'endgames'>('home');

  // Game configuration
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [boardOrientation, setBoardOrientation] = useState<PieceColor>('w');
  const [boardTheme, setBoardTheme] = useState<'classic' | 'wood' | 'midnight' | 'emerald' | 'tournament'>('classic');
  const [persona, setPersona] = useState<CoachPersona>('drona');
  const [gameMode, setGameMode] = useState<'match' | 'coach' | 'two-player'>('match');
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  // Game instance & state
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evaluatedMoves, setEvaluatedMoves] = useState<EvaluatedMove[]>([]);
  const [lastMoveSquares, setLastMoveSquares] = useState<{ from: string; to: string } | null>(null);
  const [lastEvaluatedMove, setLastEvaluatedMove] = useState<EvaluatedMove | null>(null);
  const [isShowingAlternative, setIsShowingAlternative] = useState(false);
  const [coachHint, setCoachHint] = useState<string | null>(null);
  const [currentEvalScore, setCurrentEvalScore] = useState<number>(0);
  const [currentOpeningName, setCurrentOpeningName] = useState<string>('Starting Position');
  const [isListening, setIsListening] = useState(false);

  // Post game modal & summary
  const [postGameSummary, setPostGameSummary] = useState<GameSummary | null>(null);
  const [showPostGameModal, setShowPostGameModal] = useState(false);
  const [showRestartSidePicker, setShowRestartSidePicker] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Position repetition tracker for Threefold Repetition & Tie detection
  const positionCountsRef = useRef<Map<string, number>>(new Map());

  // Engine instance
  const engineRef = useRef(new ChessEngine(difficulty));

  // Update engine difficulty when changed
  useEffect(() => {
    engineRef.current.setDifficulty(difficulty);
  }, [difficulty]);

  // Voice Mode Toggle Handler
  const handleToggleVoice = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    voiceCoach.setVoiceEnabled(nextState);
    if (nextState) {
      soundEffects.playVoiceChime();
      voiceCoach.speak('Voice mode on. I am ready to guide you.', 'urgent');
    } else {
      voiceCoach.stopSpeaking();
    }
  };

  // Voice command listener
  useEffect(() => {
    const unsub = voiceCoach.subscribeCommand((command, raw) => {
      if (command === 'hint') {
        handleAskHint();
      } else if (command === 'undo') {
        handleUndoMove();
      } else if (command === 'restart') {
        handleRestartGame();
      } else if (command === 'evaluate') {
        announcePositionEvaluation();
      } else {
        tryMoveFromSan(raw);
      }
    });

    const unsubStatus = voiceCoach.subscribeStatus((st) => {
      setIsListening(st.isListening);
    });

    return () => {
      unsub();
      unsubStatus();
    };
  }, [game, isAiThinking, playerColor, gameMode]);

  // Turn management
  const isPlayerTurn = gameMode === 'two-player' ? true : game.turn() === playerColor;

  // AI turn trigger & Tie Detection
  useEffect(() => {
    const currentPosKey = game.fen().split(' ').slice(0, 4).join(' ');
    const repCount = positionCountsRef.current.get(currentPosKey) || 0;
    const isTie = game.isGameOver() || game.isDraw() || game.isThreefoldRepetition() || repCount >= 3;

    if (isTie) {
      handleGameOver();
      return;
    }

    if (gameMode === 'two-player') return;

    const currentTurn = game.turn();
    const isAiTurn = currentTurn !== playerColor;

    if (isAiTurn && !isAiThinking && !game.isGameOver()) {
      makeAiMove();
    }
  }, [game.fen(), playerColor, gameMode]);

  // Try move from spoken SAN (e.g. "play knight to f3" or "e4")
  const tryMoveFromSan = (spokenText: string) => {
    if (!isPlayerTurn || isAiThinking || game.isGameOver()) return;

    const legal = game.moves({ verbose: true });
    const cleaned = spokenText.toLowerCase().replace(/play|move|to/g, '').trim();

    const matched = legal.find(
      (m) =>
        m.san.toLowerCase() === cleaned ||
        m.to.toLowerCase() === cleaned ||
        `${m.piece}${m.to}`.toLowerCase() === cleaned
    );

    if (matched) {
      handlePlayerMove({ from: matched.from, to: matched.to, promotion: matched.promotion });
    }
  };

  const announcePositionEvaluation = () => {
    const evalCp = evaluateBoard(game);
    const scoreFormatted = (evalCp / 100).toFixed(1);
    let desc = 'The position is roughly equal.';
    if (evalCp > 150) desc = 'White has an advantage.';
    if (evalCp > 300) desc = 'White is winning.';
    if (evalCp < -150) desc = 'Black has an advantage.';
    if (evalCp < -300) desc = 'Black is winning.';

    voiceCoach.speak(`Evaluation: ${scoreFormatted}. ${desc}`, 'urgent');
  };

  const handlePlayerMove = (moveInput: { from: string; to: string; promotion?: string }) => {
    if (!isPlayerTurn || isAiThinking || game.isGameOver()) return;

    try {
      const fenBefore = game.fen();
      const moveNumber = Math.floor(game.history().length / 2) + 1;

      // Preserve full move history via PGN instead of wiping with FEN
      const clone = new Chess();
      if (game.history().length > 0) {
        clone.loadPgn(game.pgn());
      }
      const moveResult = clone.move({
        from: moveInput.from,
        to: moveInput.to,
        promotion: moveInput.promotion || 'q',
      });

      if (!moveResult) return;

      // Track position repetition for Threefold Repetition & Tie detection
      const posKey = clone.fen().split(' ').slice(0, 4).join(' ');
      const repCount = (positionCountsRef.current.get(posKey) || 0) + 1;
      positionCountsRef.current.set(posKey, repCount);

      // Audio feedback
      if (moveResult.captured) {
        soundEffects.playCapture();
      } else if (moveResult.flags.includes('k') || moveResult.flags.includes('q')) {
        soundEffects.playCastle();
      } else {
        soundEffects.playMove();
      }

      if (clone.isCheck()) {
        soundEffects.playCheck();
      }

      // Evaluate the player's move
      const evalReport = evaluatePlayedMove(
        fenBefore,
        moveResult,
        moveNumber
      );

      setLastEvaluatedMove(evalReport);
      setEvaluatedMoves((prev) => [...prev, evalReport]);
      setLastMoveSquares({ from: moveInput.from, to: moveInput.to });
      setIsShowingAlternative(false);
      setCoachHint(null);

      // Play audio classification chime
      if (evalReport.classification === 'brilliant') soundEffects.playVictory();
      else if (evalReport.classification === 'blunder') soundEffects.playBlunderAlert();

      // Speak commentary if coach mode
      if (gameMode === 'coach' && voiceEnabled) {
        const spokenComment = getTranslatedExplanation(
          language,
          evalReport.classification,
          evalReport.san,
          evalReport.tacticalTheme
        );
        voiceCoach.speak(spokenComment, evalReport.classification === 'blunder' ? 'urgent' : 'normal');
      }

      setGame(clone);
      setCurrentEvalScore(evaluateBoard(clone));

      // Identify opening
      const sanHistory = clone.history();
      const opInfo = identifyOpening(sanHistory);
      setCurrentOpeningName(opInfo.variationName);
    } catch {
      // Invalid move
    }
  };

  const makeAiMove = () => {
    setIsAiThinking(true);
    const thinkDelay = difficulty === 'Beginner' ? 450 : difficulty === 'Master' ? 850 : 600;

    setTimeout(() => {
      try {
        const clone = new Chess();
        if (game.history().length > 0) {
          clone.loadPgn(game.pgn());
        }
        const result = engineRef.current.findBestMove(clone, difficulty, false, positionCountsRef.current);

        if (result.move) {
          const aiMoveResult = clone.move(result.move);
          if (aiMoveResult) {
            // Track position repetition
            const posKey = clone.fen().split(' ').slice(0, 4).join(' ');
            const repCount = (positionCountsRef.current.get(posKey) || 0) + 1;
            positionCountsRef.current.set(posKey, repCount);

            if (aiMoveResult.captured) {
              soundEffects.playCapture();
            } else if (aiMoveResult.flags.includes('k') || aiMoveResult.flags.includes('q')) {
              soundEffects.playCastle();
            } else {
              soundEffects.playMove();
            }

            if (clone.isCheck()) {
              soundEffects.playCheck();
            }

            setLastMoveSquares({ from: aiMoveResult.from, to: aiMoveResult.to });
            setGame(clone);
            setCurrentEvalScore(evaluateBoard(clone));

            // Identify opening
            const sanHistory = clone.history();
            const opInfo = identifyOpening(sanHistory);
            setCurrentOpeningName(opInfo.variationName);

            // Announce move if voice enabled
            if (voiceEnabled) {
              if (clone.isCheck()) {
                voiceCoach.speak(`Check! Drona plays ${aiMoveResult.san}.`, 'urgent');
              } else if (sanHistory.length === 1 && playerColor === 'b') {
                voiceCoach.speak(`Drona opens with ${aiMoveResult.san}. Your move as Black!`, 'normal');
              }
            }
          }
        }
      } catch {
        // Safe catch
      } finally {
        setIsAiThinking(false);
      }
    }, thinkDelay);
  };

  const handleGameOver = () => {
    let result: 'win' | 'loss' | 'draw' = 'draw';
    let reason = 'Draw';

    const currentKey = game.fen().split(' ').slice(0, 4).join(' ');
    const count = positionCountsRef.current.get(currentKey) || 0;
    const isRepetition = count >= 3 || game.isThreefoldRepetition();

    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'b' : 'w';
      result = winner === playerColor ? 'win' : 'loss';
      reason = result === 'win' ? 'Checkmate — You won!' : 'Checkmate — AI won!';
      if (result === 'win') {
        soundEffects.playVictory();
        if (voiceEnabled) voiceCoach.speak('Outstanding victory! Checkmate delivered.', 'urgent');
      } else {
        if (voiceEnabled) voiceCoach.speak('Checkmate delivered. Let us review the match.', 'urgent');
      }
    } else if (game.isStalemate()) {
      result = 'draw';
      reason = 'Stalemate — Game tied!';
      soundEffects.playVoiceChime();
      if (voiceEnabled) voiceCoach.speak('Game drawn by stalemate. It is a tie!', 'urgent');
    } else if (isRepetition) {
      result = 'draw';
      reason = 'Threefold Repetition — Game tied!';
      soundEffects.playVoiceChime();
      if (voiceEnabled) voiceCoach.speak('Game drawn by threefold repetition. It is a tie!', 'urgent');
    } else if (game.isInsufficientMaterial()) {
      result = 'draw';
      reason = 'Insufficient Material — Game tied!';
      soundEffects.playVoiceChime();
      if (voiceEnabled) voiceCoach.speak('Game drawn by insufficient material. It is a tie!', 'urgent');
    } else if (game.isDraw()) {
      result = 'draw';
      reason = '50-Move Rule — Game tied!';
      soundEffects.playVoiceChime();
      if (voiceEnabled) voiceCoach.speak('Game drawn by fifty-move rule. It is a tie!', 'urgent');
    } else {
      result = 'draw';
      reason = 'Game Drawn — Tie!';
      soundEffects.playVoiceChime();
      if (voiceEnabled) voiceCoach.speak('Game drawn. It is a tie!', 'urgent');
    }

    // Classifications tally
    const counts: GameSummary['classifications'] = {
      brilliant: 0,
      best: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
    };

    evaluatedMoves.forEach((m) => {
      if (m.classification && counts[m.classification] !== undefined) {
        counts[m.classification] += 1;
      }
    });

    const accObj = calculateGameAccuracy(evaluatedMoves);
    const accuracy = playerColor === 'w' ? accObj.white : accObj.black;
    const aiAccuracy = playerColor === 'w' ? accObj.black : accObj.white;
    const opInfo = identifyOpening(game.history());

    const summary: GameSummary = {
      id: `game-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      playerColor,
      difficulty,
      result,
      resultReason: reason,
      movesCount: game.history().length,
      playerAccuracy: accuracy,
      aiAccuracy,
      openingName: opInfo.opening ? opInfo.opening.name : opInfo.variationName,
      openingEco: opInfo.opening ? opInfo.opening.eco : 'A00',
      moves: evaluatedMoves,
      classifications: counts,
      phaseAccuracy: {
        opening: Math.min(100, accuracy + 5),
        middlegame: accuracy,
        endgame: Math.max(50, accuracy - 4),
      },
      criticalMoments: evaluatedMoves
        .map((m, idx) => (m.classification === 'blunder' || m.classification === 'mistake' ? idx : -1))
        .filter((idx) => idx !== -1),
      drDronaTakeaway:
        result === 'win'
          ? 'Exceptional tactical sharpness! Your piece coordination decisively broke through the center.'
          : 'Valuable learning match! Keep an eye on piece safety and king castling.',
    };

    setPostGameSummary(summary);
    recordCompletedGame(summary);
    setShowPostGameModal(true);
  };

  const handleRestartGame = (
    newColor?: PieceColor,
    newDifficulty?: DifficultyLevel,
    newMode?: 'match' | 'coach' | 'two-player'
  ) => {
    const activeColor = newColor !== undefined ? newColor : playerColor;
    const activeDiff = newDifficulty || difficulty;
    const activeMode = newMode || gameMode;

    if (newColor !== undefined) {
      setPlayerColor(newColor);
      setBoardOrientation(newColor);
    }
    if (newDifficulty) setDifficulty(newDifficulty);
    if (newMode) setGameMode(newMode);

    const newG = new Chess();
    setGame(newG);
    positionCountsRef.current.clear();
    const startKey = newG.fen().split(' ').slice(0, 4).join(' ');
    positionCountsRef.current.set(startKey, 1);

    setEvaluatedMoves([]);
    setLastMoveSquares(null);
    setLastEvaluatedMove(null);
    setIsShowingAlternative(false);
    setCoachHint(null);
    setCurrentEvalScore(0);
    setCurrentOpeningName('Starting Position');
    soundEffects.playVoiceChime();

    if (activeMode !== 'two-player' && activeColor === 'b') {
      if (voiceEnabled) {
        voiceCoach.speak('You are playing as Black. Drona AI will make the opening move.', 'urgent');
      }
    } else {
      if (voiceEnabled) {
        voiceCoach.speak('New game started. You are playing as White. Occupy the center!', 'urgent');
      }
    }
  };

  const handleLoadOpening = (moves: string[], name: string) => {
    const newG = new Chess();
    for (const m of moves) {
      try {
        newG.move(m.replace(/[?!+#]/g, ''));
      } catch {
        // ignore
      }
    }
    setGame(newG);
    setEvaluatedMoves([]);
    setLastMoveSquares(null);
    setLastEvaluatedMove(null);
    setCoachHint(null);
    setCurrentOpeningName(name);
    setCurrentTab('play');
    voiceCoach.speak(`Opening loaded: ${name}. Your move!`, 'normal');
  };

  const handleLoadEndgame = (fen: string, title: string, turn: PieceColor = 'w') => {
    const newG = new Chess(fen);
    setGame(newG);
    setPlayerColor(turn);
    setBoardOrientation(turn);
    setEvaluatedMoves([]);
    setLastMoveSquares(null);
    setLastEvaluatedMove(null);
    setCoachHint(null);
    setCurrentOpeningName(`Endgame: ${title}`);
    setCurrentTab('play');
    voiceCoach.speak(`Endgame loaded: ${title}. Find the technique!`, 'normal');
  };

  const handleUndoMove = () => {
    if (game.history().length === 0 || isAiThinking) return;

    try {
      const clone = new Chess(game.fen());
      clone.undo();
      if (gameMode !== 'two-player' && clone.turn() !== playerColor && clone.history().length > 0) {
        clone.undo();
      }

      setGame(clone);
      setEvaluatedMoves((prev) => prev.slice(0, Math.max(0, prev.length - 2)));
      setLastEvaluatedMove(null);
      setIsShowingAlternative(false);
      setCoachHint('Move taken back.');
      soundEffects.playMove();
    } catch {
      // Safe catch
    }
  };

  const handleAskHint = () => {
    if (!isPlayerTurn || isAiThinking || game.isGameOver()) return;

    const best = engineRef.current.findBestMove(game, 'Intermediate', true);
    if (best.move) {
      const hintText = getTranslatedHint(language, best.move.san, best.move.from, best.move.to);
      setCoachHint(hintText);
      voiceCoach.speak(hintText, 'urgent');
    }
  };

  const handleFlipBoard = () => {
    // If game has not started yet (0 moves), flipping board orientation switches player's side!
    if (game.history().length === 0) {
      const nextColor: PieceColor = playerColor === 'w' ? 'b' : 'w';
      handleRestartGame(nextColor);
      return;
    }
    // If match already has moves, toggle view orientation
    setBoardOrientation((prev) => (prev === 'w' ? 'b' : 'w'));
  };

  const handleResign = () => {
    if (window.confirm('Resign the game?')) {
      handleGameOver();
    }
  };

  // Start game from Home Screen
  const handleStartGameFromHome = (options?: { difficulty?: DifficultyLevel; color?: PieceColor; mode?: 'match' | 'coach' | 'two-player' }) => {
    const targetColor = options?.color !== undefined ? options.color : 'w';
    handleRestartGame(targetColor, options?.difficulty, options?.mode);
    setCurrentTab('play');
  };

  // Highlights to draw on board
  const currentHighlights: { square: string; color: 'red' | 'green' | 'yellow' | 'blue' }[] = [];
  if (isShowingAlternative && lastEvaluatedMove?.bestMoveFrom && lastEvaluatedMove?.bestMoveTo) {
    currentHighlights.push(
      { square: lastEvaluatedMove.bestMoveFrom, color: 'green' },
      { square: lastEvaluatedMove.bestMoveTo, color: 'green' }
    );
  }

  const opponentColor = playerColor === 'w' ? 'b' : 'w';
  const opponentName = gameMode === 'two-player' ? 'Player 2' : 'Dr. Drona AI';
  const playerName = gameMode === 'two-player' ? 'Player 1' : 'You';

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Header - Shown on gameplay and sub-screens */}
      {currentTab !== 'home' && (
        <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('home')}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="Back to Home"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
                ♚
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wide text-slate-100 flex items-center gap-1">
                  DRONA AI
                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    CHESS
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5">
            {/* Quick Language Dropdown */}
            <select
              value={language}
              onChange={(e) => {
                const lang = e.target.value as SupportedLanguage;
                setLanguage(lang);
                voiceCoach.setLanguage(lang);
                const welcome = TRANSLATIONS[lang]?.welcomeVoice || TRANSLATIONS.en.welcomeVoice;
                voiceCoach.speak(welcome, 'urgent');
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-amber-300 font-bold text-xs focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName}
                </option>
              ))}
            </select>

            {/* In-Game Voice Mode ON / OFF Quick Toggle */}
            <button
              onClick={handleToggleVoice}
              className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                voiceEnabled
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={voiceEnabled ? 'Voice Mode: ON (Click to mute Drona voice)' : 'Voice Mode: OFF (Click to unmute Drona voice)'}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-extrabold">Voice ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-extrabold">Voice OFF</span>
                </>
              )}
            </button>

            {/* Mic Toggle */}
            <button
              onClick={() => voiceCoach.toggleListening()}
              className={`p-1.5 rounded-xl border transition-colors ${
                isListening
                  ? 'bg-rose-500/25 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isListening ? 'Microphone active' : 'Click to speak chess moves'}
            >
              {isListening ? <Mic className="w-4 h-4 text-rose-400" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition-colors"
              title="Game Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      )}

      {/* Main Screen Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col pb-20 md:pb-6 px-1 pt-1">
        {/* 1. HOME SCREEN */}
        {currentTab === 'home' && (
          <HomeScreen
            onStartGame={handleStartGameFromHome}
            onNavigateTab={setCurrentTab}
            onOpenSettings={() => setIsSettingsOpen(true)}
            language={language}
            onLanguageChange={setLanguage}
            currentDifficulty={difficulty}
          />
        )}

        {/* 2. CHESS PLAY SCREEN (Full Interactive Mobile Gaming Layout) */}
        {currentTab === 'play' && (
          <div className="w-full flex flex-col gap-1.5 pt-0.5">
            {/* Top Opponent Player Card */}
            <div className="w-full max-w-xl mx-auto px-1">
              <div className={`p-2 rounded-2xl bg-slate-900/90 border transition-all flex items-center justify-between ${
                game.turn() === opponentColor ? 'border-amber-500/60 shadow-md shadow-amber-500/10' : 'border-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    {gameMode === 'two-player' ? (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                        👤
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl overflow-hidden border border-purple-500/60 shadow-md shadow-purple-900/30">
                        <img
                          src="/assets/aistudio/file_0000000081148208b0396e1156607bc3_4c785c10.png"
                          alt="Dr. Drona"
                          className="w-full h-full object-cover object-[50%_12%]"
                        />
                      </div>
                    )}
                    {isAiThinking && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-100">{opponentName}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {gameMode === 'two-player' ? (opponentColor === 'w' ? '⚪ White' : '⚫ Black') : `${difficulty} (${opponentColor === 'w' ? '⚪ White' : '⚫ Black'})`}
                      </span>
                    </div>
                    <CapturedPieces game={game} color={opponentColor} />
                  </div>
                </div>

                {/* Move counter / Turn status */}
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  {game.turn() === opponentColor && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Turn
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* The Chessboard */}
            <div className="w-full max-w-xl mx-auto">
              <Chessboard
                game={game}
                orientation={boardOrientation}
                onMove={handlePlayerMove}
                isInteractive={isPlayerTurn && !isAiThinking && !game.isGameOver()}
                highlightSquares={currentHighlights}
                lastMove={lastMoveSquares}
                boardTheme={boardTheme}
              />
            </div>

            {/* Bottom Player Card */}
            <div className="w-full max-w-xl mx-auto px-1">
              <div className={`p-2 rounded-2xl bg-slate-900/90 border transition-all flex items-center justify-between ${
                game.turn() === playerColor ? 'border-amber-500/60 shadow-md shadow-amber-500/10' : 'border-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-300">
                    👤
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-100">{playerName}</span>
                      {/* 1-Tap Side Switcher: Choose White or Black */}
                      <div className="flex items-center bg-slate-950/90 p-0.5 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            if (playerColor !== 'w') {
                              handleRestartGame('w');
                            }
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                            playerColor === 'w'
                              ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/40 ring-1 ring-amber-400'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="Play as White (You move 1st)"
                        >
                          <span>⚪</span>
                          <span>White</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (playerColor !== 'b') {
                              handleRestartGame('b');
                            }
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                            playerColor === 'b'
                              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/40 ring-1 ring-purple-400'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="Play as Black (Drona moves 1st)"
                        >
                          <span>⚫</span>
                          <span>Black</span>
                        </button>
                      </div>
                    </div>
                    <CapturedPieces game={game} color={playerColor} />
                  </div>
                </div>

                <div className="flex items-center gap-1 font-mono text-[11px]">
                  {game.turn() === playerColor && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Your Turn
                    </span>
                  )}
                  {game.turn() !== playerColor && !game.isGameOver() && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                      AI Turn
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Dr. Drona Coaching Dialogue Card */}
            <DronaSpeechCard
              lastEvaluatedMove={lastEvaluatedMove}
              coachHint={coachHint}
              onAskHint={handleAskHint}
              onToggleAlternative={() => setIsShowingAlternative((prev) => !prev)}
              isShowingAlternative={isShowingAlternative}
              isPlayerTurn={isPlayerTurn}
              isAiThinking={isAiThinking}
              language={language}
              voiceEnabled={voiceEnabled}
              onToggleVoice={handleToggleVoice}
            />

            {/* Game Action Controller Dock */}
            <div className="w-full max-w-xl mx-auto px-1">
              <div className="p-1 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-1 text-xs">
                <button
                  onClick={handleAskHint}
                  disabled={!isPlayerTurn || isAiThinking || game.isGameOver()}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 disabled:opacity-40 text-amber-300 font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hint</span>
                </button>

                <button
                  onClick={handleUndoMove}
                  disabled={game.history().length === 0 || isAiThinking}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 disabled:opacity-40 text-slate-300 font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>

                <button
                  onClick={handleFlipBoard}
                  className="p-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 transition-colors"
                  title="Flip Board / Switch Sides"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setShowRestartSidePicker(true)}
                  className="p-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 transition-colors"
                  title="Restart Match / Switch Sides"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleResign}
                  disabled={game.isGameOver()}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Resign</span>
                </button>
              </div>
            </div>

            {/* Move History Strip */}
            {game.history().length > 0 && (
              <div className="w-full max-w-xl mx-auto px-1">
                <div className="flex items-center gap-1 overflow-x-auto py-1 px-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono scrollbar-none">
                  {game.history().map((san, idx) => (
                    <span
                      key={idx}
                      className={`px-1.5 py-0.5 rounded shrink-0 ${
                        idx % 2 === 0
                          ? 'text-amber-200 bg-amber-500/10'
                          : 'text-slate-300 bg-slate-800/60'
                      }`}
                    >
                      {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}
                      {san}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. TACTICS / PUZZLE ARENA */}
        {currentTab === 'puzzles' && (
          <PuzzleArena onBackToHome={() => setCurrentTab('home')} />
        )}

        {/* 4. TRAINING ARENA */}
        {currentTab === 'train' && (
          <TrainingView
            onNavigateToOpenings={() => setCurrentTab('openings')}
            onNavigateToEndgames={() => setCurrentTab('endgames')}
            onBackToGame={() => setCurrentTab('play')}
          />
        )}

        {/* 5. STATS / CAREER PROGRESS */}
        {currentTab === 'stats' && (
          <DashboardView onBackToGame={() => setCurrentTab('play')} />
        )}

        {/* 6. OPENINGS REPERTOIRE */}
        {currentTab === 'openings' && (
          <OpeningsView
            onBackToGame={() => setCurrentTab('play')}
            onPlayOpeningOnBoard={handleLoadOpening}
          />
        )}

        {/* 7. ENDGAME DRILLS */}
        {currentTab === 'endgames' && (
          <EndgameView
            onBackToGame={() => setCurrentTab('play')}
            onPlayOnMainBoard={handleLoadEndgame}
          />
        )}
      </main>

      {/* Android Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'play', label: 'Play', icon: Play },
            { id: 'puzzles', label: 'Puzzles', icon: Zap },
            { id: 'train', label: 'Train', icon: Target },
            { id: 'stats', label: 'Stats', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-amber-400 font-extrabold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'fill-amber-400/20' : ''}`} />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Post-Game Analysis Modal */}
      {showPostGameModal && postGameSummary && (
        <PostGameModal
          summary={postGameSummary}
          onClose={() => setShowPostGameModal(false)}
          onPlayAgain={() => {
            setShowPostGameModal(false);
            handleRestartGame();
          }}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        boardTheme={boardTheme}
        onBoardThemeChange={setBoardTheme}
        persona={persona}
        onPersonaChange={setPersona}
        language={language}
        onLanguageChange={setLanguage}
        soundMuted={soundMuted}
        onSoundMuteToggle={() => setSoundMuted(!soundMuted)}
        voiceEnabled={voiceEnabled}
        onVoiceToggle={() => setVoiceEnabled(!voiceEnabled)}
      />

      {/* In-Game Choose Side & Restart Modal */}
      {showRestartSidePicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <h3 className="font-black text-sm text-amber-200 flex items-center gap-1.5">
                <span>⚔️</span> New Match / Choose Side
              </h3>
              <button
                onClick={() => setShowRestartSidePicker(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Pick your side to start fresh:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => {
                  setShowRestartSidePicker(false);
                  handleRestartGame('w');
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  playerColor === 'w'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-3xl mb-1">♔</span>
                <span className="font-bold text-xs">Play as White</span>
                <span className="text-[10px] text-slate-400">You move 1st</span>
              </button>

              <button
                onClick={() => {
                  setShowRestartSidePicker(false);
                  handleRestartGame('b');
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  playerColor === 'b'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-200 ring-1 ring-purple-400 shadow-md shadow-purple-500/20'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-3xl mb-1">♚</span>
                <span className="font-bold text-xs">Play as Black</span>
                <span className="text-[10px] text-purple-300">Drona moves 1st</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setShowRestartSidePicker(false);
                  const randomColor: PieceColor = Math.random() < 0.5 ? 'w' : 'b';
                  handleRestartGame(randomColor);
                }}
                className="w-full p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-bold text-slate-300 hover:border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🎲</span> Random Side (50 / 50)
              </button>

              <button
                onClick={() => {
                  setShowRestartSidePicker(false);
                  handleRestartGame(playerColor);
                }}
                className="w-full p-2 rounded-xl bg-slate-800/60 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Restart Current Match ({playerColor === 'w' ? 'White' : 'Black'})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
