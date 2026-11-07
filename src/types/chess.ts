export type PieceColor = 'w' | 'b';
export type DifficultyLevel = 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';

export type MoveClassification = 
  | 'brilliant' 
  | 'best' 
  | 'excellent' 
  | 'good' 
  | 'inaccuracy' 
  | 'mistake' 
  | 'blunder' 
  | 'book';

export interface EvaluatedMove {
  moveNumber: number;
  color: PieceColor;
  san: string;
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  fenBefore: string;
  fenAfter: string;
  evalBefore: number; // in centipawns, from white's perspective
  evalAfter: number; // in centipawns, from white's perspective
  evalDelta: number; // change for the player who made the move
  bestMoveSan: string;
  bestMoveFrom: string;
  bestMoveTo: string;
  classification: MoveClassification;
  coachExplanation: string;
  tacticalTheme?: string;
  threatsIdentified?: string[];
  visualHighlights?: {
    highlightSquares?: { square: string; color: 'red' | 'green' | 'yellow' | 'blue' }[];
    arrows?: { from: string; to: string; color: 'green' | 'red' | 'yellow' }[];
  };
}

export interface GameSummary {
  id: string;
  date: string;
  playerColor: PieceColor;
  difficulty: DifficultyLevel;
  result: 'win' | 'loss' | 'draw' | 'in_progress';
  resultReason: string;
  movesCount: number;
  playerAccuracy: number;
  aiAccuracy: number;
  openingName: string;
  openingEco: string;
  moves: EvaluatedMove[];
  classifications: {
    brilliant: number;
    best: number;
    excellent: number;
    good: number;
    inaccuracy: number;
    mistake: number;
    blunder: number;
    book?: number;
  };
  phaseAccuracy: {
    opening: number;
    middlegame: number;
    endgame: number;
  };
  criticalMoments: number[]; // indices of moves that were major turning points
  drDronaTakeaway: string;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  averageAccuracy: number;
  difficultyStats: Record<DifficultyLevel, { games: number; wins: number; losses: number; draws: number }>;
  frequentMistakes: { category: string; count: number; advice: string }[];
  openingsStats: Record<string, { played: number; wins: number; losses: number; draws: number }>;
  endgameConversionRate: number;
  recentGames: GameSummary[];
}

export interface OpeningData {
  eco: string;
  name: string;
  variation?: string;
  moves: string[]; // array of SAN moves
  description: string;
  principles: string[];
  recommendedFor: 'White' | 'Black' | 'Both';
  traps?: {
    name: string;
    description: string;
    moves: string[];
    warning: string;
  }[];
}

export interface EndgameDrill {
  id: string;
  title: string;
  category: 'king-pawn' | 'rook' | 'queen' | 'minor' | 'mating-patterns';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  fen: string;
  turn: PieceColor;
  targetObjective: string;
  keyConcepts: string[];
  drDronaHint: string;
  maxMoves?: number;
}
