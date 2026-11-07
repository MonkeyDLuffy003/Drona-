import { Chess, Square, Move } from 'chess.js';
import { DifficultyLevel, PieceColor } from '../types/chess';

// Material weights
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece Square Tables (White's perspective from a1=index 56 to h8=index 7)
// Standard 64-element arrays (rank 8 to rank 1)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  5,  0,  0,  5,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MIDDLEGAME_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

const KING_ENDGAME_TABLE = [
  -50,-40,-30,-20,-20,-30,-40,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50
];

function squareToIndex(sq: string, flip: boolean): number {
  const file = sq.charCodeAt(0) - 97; // a=0, h=7
  const rank = 8 - parseInt(sq[1], 10); // 8=0, 1=7
  const idx = rank * 8 + file;
  return flip ? 63 - idx : idx;
}

/**
 * Static evaluation function from White's perspective (+ is white advantage, - is black advantage)
 */
export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -30000 : 30000;
  }
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
    return 0;
  }

  let score = 0;
  let totalNonPawnMaterial = 0;
  let whiteBishops = 0;
  let blackBishops = 0;

  const board = game.board();

  // First pass: material and piece-square tables
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      const isWhite = piece.color === 'w';

      if (piece.type !== 'p' && piece.type !== 'k') {
        totalNonPawnMaterial += val;
      }
      if (piece.type === 'b') {
        if (isWhite) whiteBishops++;
        else blackBishops++;
      }

      // Piece square table index
      const sqIndex = r * 8 + f;
      let psqt = 0;

      switch (piece.type) {
        case 'p':
          psqt = isWhite ? PAWN_TABLE[sqIndex] : PAWN_TABLE[63 - sqIndex];
          break;
        case 'n':
          psqt = isWhite ? KNIGHT_TABLE[sqIndex] : KNIGHT_TABLE[63 - sqIndex];
          break;
        case 'b':
          psqt = isWhite ? BISHOP_TABLE[sqIndex] : BISHOP_TABLE[63 - sqIndex];
          break;
        case 'r':
          psqt = isWhite ? ROOK_TABLE[sqIndex] : ROOK_TABLE[63 - sqIndex];
          break;
        case 'q':
          psqt = isWhite ? QUEEN_TABLE[sqIndex] : QUEEN_TABLE[63 - sqIndex];
          break;
        case 'k':
          // Transition to endgame table if non-pawn material is under 1500
          const isEndgame = totalNonPawnMaterial < 1500;
          const kTable = isEndgame ? KING_ENDGAME_TABLE : KING_MIDDLEGAME_TABLE;
          psqt = isWhite ? kTable[sqIndex] : kTable[63 - sqIndex];
          break;
      }

      if (isWhite) {
        score += val + psqt;
      } else {
        score -= val + psqt;
      }
    }
  }

  // Bishop pair bonus
  if (whiteBishops >= 2) score += 35;
  if (blackBishops >= 2) score -= 35;

  return score;
}

/**
 * Minimax with Alpha-Beta Pruning and Quiescence Search
 */
export class ChessEngine {
  private maxDepth: number = 3;
  private nodesCount: number = 0;

  constructor(difficulty: DifficultyLevel = 'Intermediate') {
    this.setDifficulty(difficulty);
  }

  public setDifficulty(difficulty: DifficultyLevel) {
    switch (difficulty) {
      case 'Beginner':
        this.maxDepth = 1;
        break;
      case 'Easy':
        this.maxDepth = 2;
        break;
      case 'Intermediate':
        this.maxDepth = 3;
        break;
      case 'Advanced':
        this.maxDepth = 4;
        break;
      case 'Expert':
        this.maxDepth = 5;
        break;
      case 'Master':
        this.maxDepth = 6;
        break;
    }
  }

  /**
   * Order moves to improve alpha-beta pruning speed (Captures first, checks, then quiet moves)
   */
  private orderMoves(moves: Move[]): Move[] {
    return [...moves].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
      if (a.captured) {
        const victimVal = PIECE_VALUES[a.captured] || 0;
        const attackerVal = PIECE_VALUES[a.piece] || 0;
        scoreA += 1000 + victimVal - attackerVal / 10;
      }
      if (b.captured) {
        const victimVal = PIECE_VALUES[b.captured] || 0;
        const attackerVal = PIECE_VALUES[b.piece] || 0;
        scoreB += 1000 + victimVal - attackerVal / 10;
      }

      if (a.promotion) scoreA += 900;
      if (b.promotion) scoreB += 900;

      if (a.san.includes('+')) scoreA += 50;
      if (b.san.includes('+')) scoreB += 50;

      return scoreB - scoreA;
    });
  }

  /**
   * Quiescence search to avoid horizon effect on tactical captures
   */
  private quiescence(game: Chess, alpha: number, beta: number, depth: number = 0): number {
    this.nodesCount++;
    const standPat = evaluateBoard(game);

    if (depth >= 4) return standPat;

    const isWhiteTurn = game.turn() === 'w';

    if (isWhiteTurn) {
      if (standPat >= beta) return beta;
      if (standPat > alpha) alpha = standPat;
    } else {
      if (standPat <= alpha) return alpha;
      if (standPat < beta) beta = standPat;
    }

    // Only search captures
    const captureMoves = game.moves({ verbose: true }).filter((m) => m.captured || m.promotion);
    const ordered = this.orderMoves(captureMoves);

    for (const move of ordered) {
      game.move(move);
      const score = this.quiescence(game, alpha, beta, depth + 1);
      game.undo();

      if (isWhiteTurn) {
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      } else {
        if (score <= alpha) return alpha;
        if (score < beta) beta = score;
      }
    }

    return isWhiteTurn ? alpha : beta;
  }

  /**
   * Minimax search with alpha-beta pruning
   */
  private minimax(
    game: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): { score: number; bestMove: Move | null } {
    this.nodesCount++;

    if (depth === 0 || game.isGameOver()) {
      // At leaf, run quiescence if master/expert or evaluate board
      const score = this.maxDepth >= 4 ? this.quiescence(game, alpha, beta) : evaluateBoard(game);
      return { score, bestMove: null };
    }

    const legalMoves = game.moves({ verbose: true });
    if (legalMoves.length === 0) {
      if (game.isCheck()) {
        return { score: isMaximizing ? -30000 : 30000, bestMove: null };
      }
      return { score: 0, bestMove: null };
    }

    const orderedMoves = this.orderMoves(legalMoves);
    let bestMove: Move | null = orderedMoves[0];

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of orderedMoves) {
        game.move(move);
        const result = this.minimax(game, depth - 1, alpha, beta, false);
        game.undo();

        if (result.score > maxScore) {
          maxScore = result.score;
          bestMove = move;
        }
        alpha = Math.max(alpha, result.score);
        if (beta <= alpha) break; // Beta cut-off
      }
      return { score: maxScore, bestMove };
    } else {
      let minScore = Infinity;
      for (const move of orderedMoves) {
        game.move(move);
        const result = this.minimax(game, depth - 1, alpha, beta, true);
        game.undo();

        if (result.score < minScore) {
          minScore = result.score;
          bestMove = move;
        }
        beta = Math.min(beta, result.score);
        if (beta <= alpha) break; // Alpha cut-off
      }
      return { score: minScore, bestMove };
    }
  }

  /**
   * Finds the best move from the current position.
   * Also applies intentional handicap / blunder probabilities for lower difficulties,
   * and prevents endless piece shuffling / move repetition.
   */
  public findBestMove(
    game: Chess,
    difficulty: DifficultyLevel = 'Intermediate',
    deterministic: boolean = false,
    positionCounts?: Map<string, number>
  ): { move: Move | null; score: number } {
    this.nodesCount = 0;
    this.setDifficulty(difficulty);

    const legalMoves = game.moves({ verbose: true });
    if (legalMoves.length === 0) return { move: null, score: 0 };

    if (!deterministic) {
      // Humanized blunders on Beginner & Easy
      if (difficulty === 'Beginner' && Math.random() < 0.4 && legalMoves.length > 1) {
        // Filter out immediate repetitions if alternative available
        const nonRepeating = positionCounts
          ? legalMoves.filter((m) => {
              game.move(m);
              const key = game.fen().split(' ').slice(0, 4).join(' ');
              const count = positionCounts.get(key) || 0;
              game.undo();
              return count < 2;
            })
          : legalMoves;
        const pool = nonRepeating.length > 0 ? nonRepeating : legalMoves;
        const randomMove = pool[Math.floor(Math.random() * pool.length)];
        return { move: randomMove, score: evaluateBoard(game) };
      }

      if (difficulty === 'Easy' && Math.random() < 0.25 && legalMoves.length > 2) {
        const pool = positionCounts
          ? legalMoves.filter((m) => {
              game.move(m);
              const key = game.fen().split(' ').slice(0, 4).join(' ');
              const count = positionCounts.get(key) || 0;
              game.undo();
              return count < 2;
            })
          : legalMoves;
        const validPool = pool.length > 0 ? pool : legalMoves;
        const subMove = validPool[Math.floor(Math.random() * Math.min(3, validPool.length))];
        return { move: subMove, score: evaluateBoard(game) };
      }
    }

    const isWhiteTurn = game.turn() === 'w';
    const result = this.minimax(game, this.maxDepth, -Infinity, Infinity, isWhiteTurn);

    let chosenMove = result.bestMove;

    // Repetition check: If chosen move causes a 2nd or 3rd repetition and AI is not losing, pick alternative move
    if (positionCounts && chosenMove && legalMoves.length > 1) {
      game.move(chosenMove);
      const posKey = game.fen().split(' ').slice(0, 4).join(' ');
      const repCount = positionCounts.get(posKey) || 0;
      game.undo();

      if (repCount >= 2) {
        // Find highest scoring non-repeating legal move
        let bestAltMove: Move | null = null;
        let bestAltScore = isWhiteTurn ? -Infinity : Infinity;

        for (const m of legalMoves) {
          game.move(m);
          const altKey = game.fen().split(' ').slice(0, 4).join(' ');
          const altCount = positionCounts.get(altKey) || 0;
          const altScore = evaluateBoard(game);
          game.undo();

          if (altCount < 2) {
            if (isWhiteTurn && altScore > bestAltScore) {
              bestAltScore = altScore;
              bestAltMove = m;
            } else if (!isWhiteTurn && altScore < bestAltScore) {
              bestAltScore = altScore;
              bestAltMove = m;
            }
          }
        }

        if (bestAltMove) {
          chosenMove = bestAltMove;
        }
      }
    }

    // Fallback if no bestMove
    if (!chosenMove && legalMoves.length > 0) {
      chosenMove = legalMoves[0];
    }

    return { move: chosenMove, score: result.score };
  }
}

export const defaultEngine = new ChessEngine('Intermediate');
