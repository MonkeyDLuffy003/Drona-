import { Chess, Move, Square } from 'chess.js';
import { EvaluatedMove, MoveClassification, PieceColor } from '../types/chess';
import { ChessEngine, evaluateBoard } from './chessEngine';

const evaluationEngine = new ChessEngine('Intermediate');

/**
 * Converts centipawns to win percentage (0 to 100) using the standard logistic model
 */
export function centipawnsToWinProbability(cp: number): number {
  // Clamp between -2000 and 2000
  const clamped = Math.max(-2000, Math.min(2000, cp));
  return 100 / (1 + Math.pow(10, -clamped / 400));
}

/**
 * Detects hanging pieces, pins, or direct tactical threats in a position
 */
export function analyzeTacticalFeatures(
  game: Chess,
  colorJustMoved: PieceColor
): {
  threats: string[];
  weakSquares: string[];
  attackedSquares: string[];
  tacticalTheme?: string;
} {
  const threats: string[] = [];
  const weakSquares: string[] = [];
  const attackedSquares: string[] = [];
  let tacticalTheme: string | undefined = undefined;

  const opponentColor = colorJustMoved === 'w' ? 'b' : 'w';

  // Check if opponent is in check
  if (game.isCheck()) {
    threats.push('Direct check on the King');
    tacticalTheme = 'Check';
  }

  // Look for hanging pieces of the player who just moved
  const board = game.board();
  const opponentMoves = game.moves({ verbose: true });

  const attackedPieces: { square: string; piece: string }[] = [];

  for (const move of opponentMoves) {
    if (move.captured) {
      attackedSquares.push(move.to);
      attackedPieces.push({ square: move.to, piece: move.captured });
    }
  }

  // Detect forks
  const opponentAttackingSquaresCount: Record<string, number> = {};
  for (const move of opponentMoves) {
    if (move.captured && (move.captured === 'q' || move.captured === 'r' || move.captured === 'b' || move.captured === 'n')) {
      opponentAttackingSquaresCount[move.from] = (opponentAttackingSquaresCount[move.from] || 0) + 1;
    }
  }

  for (const [sq, count] of Object.entries(opponentAttackingSquaresCount)) {
    if (count >= 2) {
      threats.push(`Potential fork threat originating from ${sq}`);
      tacticalTheme = 'Fork';
    }
  }

  // Detect vulnerable king / uncastled king in center
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (p && p.type === 'k' && p.color === colorJustMoved) {
        // If king is in center columns (d, e) on move 10+
        if (f >= 3 && f <= 4) {
          weakSquares.push(`${String.fromCharCode(97 + f)}${8 - r}`);
        }
      }
    }
  }

  return {
    threats,
    weakSquares,
    attackedSquares,
    tacticalTheme,
  };
}

/**
 * Classifies a move based on win probability delta and generates Dr. Drona's explanation
 */
export function evaluatePlayedMove(
  fenBefore: string,
  playedMove: Move,
  moveNumber: number
): EvaluatedMove {
  const gameBefore = new Chess(fenBefore);
  const color = gameBefore.turn();

  // Engine evaluation before move (from white's perspective)
  const bestResult = evaluationEngine.findBestMove(gameBefore, 'Intermediate', true);
  const bestMove = bestResult.move;
  const evalBefore = bestResult.score;

  // Clone and play player's move
  const gameAfter = new Chess(fenBefore);
  gameAfter.move(playedMove);
  const fenAfter = gameAfter.fen();

  // Evaluation after player's move
  const evalAfter = evaluateBoard(gameAfter);

  // Calculate delta from the moving player's perspective
  // If White moved, positive delta is good for White. If Black moved, negative evalAfter is good for Black.
  const playerEvalBefore = color === 'w' ? evalBefore : -evalBefore;
  const playerEvalAfter = color === 'w' ? evalAfter : -evalAfter;

  const winProbBefore = centipawnsToWinProbability(playerEvalBefore);
  const winProbAfter = centipawnsToWinProbability(playerEvalAfter);
  const winProbDelta = winProbAfter - winProbBefore; // negative means player lost winning chances

  const cpLoss = Math.max(0, - (playerEvalAfter - playerEvalBefore));

  let classification: MoveClassification = 'good';

  // Check for sacrifice / brilliant
  const isSacrifice = playedMove.captured === undefined && 
    (playedMove.piece === 'q' || playedMove.piece === 'r' || playedMove.piece === 'b' || playedMove.piece === 'n') &&
    winProbDelta >= -1 &&
    playerEvalAfter > 150;

  if (isSacrifice && cpLoss <= 15) {
    classification = 'brilliant';
  } else if (playedMove.san === bestMove?.san || winProbDelta >= -1.5 || cpLoss <= 15) {
    classification = 'best';
  } else if (winProbDelta >= -4 || cpLoss <= 35) {
    classification = 'excellent';
  } else if (winProbDelta >= -8 || cpLoss <= 80) {
    classification = 'good';
  } else if (winProbDelta >= -18 || cpLoss <= 180) {
    classification = 'inaccuracy';
  } else if (winProbDelta >= -32 || cpLoss <= 320) {
    classification = 'mistake';
  } else {
    classification = 'blunder';
  }

  // Tactical features
  const tactical = analyzeTacticalFeatures(gameAfter, color);

  // Generate Dr. Drona's coaching explanation
  const explanation = generateCoachExplanation(
    classification,
    playedMove,
    bestMove,
    cpLoss,
    tactical.threats,
    tactical.tacticalTheme,
    gameAfter.isCheck()
  );

  // Visual highlights - clean tile highlights only, no random squares or arrows
  const highlightSquares: { square: string; color: 'red' | 'green' | 'yellow' | 'blue' }[] = [];
  const arrows: { from: string; to: string; color: 'green' | 'red' | 'yellow' }[] = [];

  // In coach mode, highlight blunders with a subtle square indicator on the moved square
  if (classification === 'blunder') {
    highlightSquares.push({ square: playedMove.to, color: 'red' });
  }

  return {
    moveNumber,
    color,
    san: playedMove.san,
    from: playedMove.from,
    to: playedMove.to,
    piece: playedMove.piece,
    captured: playedMove.captured,
    promotion: playedMove.promotion,
    fenBefore,
    fenAfter,
    evalBefore,
    evalAfter,
    evalDelta: playerEvalAfter - playerEvalBefore,
    bestMoveSan: bestMove?.san || playedMove.san,
    bestMoveFrom: bestMove?.from || playedMove.from,
    bestMoveTo: bestMove?.to || playedMove.to,
    classification,
    coachExplanation: explanation,
    tacticalTheme: tactical.tacticalTheme,
    threatsIdentified: tactical.threats,
    visualHighlights: {
      highlightSquares,
      arrows,
    },
  };
}

/**
 * Natural language explanation builder for Dr. Drona
 */
function generateCoachExplanation(
  classification: MoveClassification,
  playedMove: Move,
  bestMove: Move | null,
  cpLoss: number,
  threats: string[],
  theme?: string,
  isCheck?: boolean
): string {
  const pieceNames: Record<string, string> = {
    p: 'Pawn',
    n: 'Knight',
    b: 'Bishop',
    r: 'Rook',
    q: 'Queen',
    k: 'King',
  };

  const pieceName = pieceNames[playedMove.piece] || 'Piece';
  const bestSan = bestMove?.san || '';

  if (classification === 'brilliant') {
    return `Brilliant find! ${playedMove.san} is a visionary tactical strike that seizes the initiative.`;
  }

  if (classification === 'best') {
    if (isCheck) {
      return `Outstanding! ${playedMove.san} applies immediate check pressure on the opponent's king.`;
    }
    if (playedMove.captured) {
      return `Exact move! ${playedMove.san} captures key material while keeping optimal piece coordination.`;
    }
    return `Top engine move! ${playedMove.san} develops smoothly and maintains maximum territorial control.`;
  }

  if (classification === 'excellent') {
    return `Very strong choice. ${playedMove.san} keeps a solid grip on the position.`;
  }

  if (classification === 'good') {
    return `Solid move. ${playedMove.san} keeps your pieces active and maintains equality.`;
  }

  if (classification === 'inaccuracy') {
    if (bestSan) {
      return `Slight inaccuracy. ${playedMove.san} slows down your tempo. A sharper idea was ${bestSan} to contest the center.`;
    }
    return `Inaccuracy. ${playedMove.san} creates slight positional passivity.`;
  }

  if (classification === 'mistake') {
    if (theme === 'Fork') {
      return `Mistake! ${playedMove.san} steps into a potential tactical fork. Better was ${bestSan} to safeguard your pieces.`;
    }
    if (threats.length > 0) {
      return `Mistake. ${playedMove.san} allows ${threats[0]}. Playing ${bestSan} was safer.`;
    }
    return `Mistake. ${playedMove.san} surrenders a notable advantage. The master recommendation was ${bestSan}.`;
  }

  // Blunder
  if (threats.length > 0) {
    return `Blunder! ${playedMove.san} leaves pieces vulnerable to ${threats[0]}. Consider ${bestSan} instead.`;
  }
  return `Serious blunder! ${playedMove.san} hands the initiative to your opponent. The winning continuation was ${bestSan}.`;
}

/**
 * Calculates overall game accuracy for White and Black
 */
export function calculateGameAccuracy(moves: EvaluatedMove[]): { white: number; black: number } {
  let whiteSum = 0;
  let whiteCount = 0;
  let blackSum = 0;
  let blackCount = 0;

  for (const m of moves) {
    const accuracy = Math.max(0, Math.min(100, 100 - Math.max(0, -m.evalDelta) * 0.18));
    if (m.color === 'w') {
      whiteSum += accuracy;
      whiteCount++;
    } else {
      blackSum += accuracy;
      blackCount++;
    }
  }

  return {
    white: whiteCount > 0 ? Math.round(whiteSum / whiteCount) : 100,
    black: blackCount > 0 ? Math.round(blackSum / blackCount) : 100,
  };
}
