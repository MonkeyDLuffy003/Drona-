import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { evaluateBoard, defaultEngine } from './chessEngine';
import { centipawnsToWinProbability, evaluatePlayedMove, calculateGameAccuracy } from './evaluator';

test('initial starting board evaluation is balanced', () => {
  const game = new Chess();
  const score = evaluateBoard(game);
  // Starting position evaluation should be close to 0 (balanced)
  assert.ok(Math.abs(score) < 50, `Initial score should be balanced, got ${score}`);
});

test('win probability formula maps 0 cp to 50%', () => {
  const prob = centipawnsToWinProbability(0);
  assert.equal(Math.round(prob), 50);
});

test('win probability formula gives high win chance for +800 cp', () => {
  const prob = centipawnsToWinProbability(800);
  assert.ok(prob > 95, `Expected prob > 95, got ${prob}`);
});

test('engine finds legal moves from starting position', () => {
  const game = new Chess();
  const result = defaultEngine.findBestMove(game, 'Beginner');
  assert.ok(result.move !== null, 'Engine must return a move');
  assert.ok(['e4', 'd4', 'Nf3', 'c4', 'Nc3', 'g3', 'e3'].some(m => result.move?.san.startsWith(m) || result.move?.san === m) || result.move?.san.length > 0);
});

test('evaluatePlayedMove classifies 1. e4 appropriately', () => {
  const game = new Chess();
  const moves = game.moves({ verbose: true });
  const e4Move = moves.find(m => m.san === 'e4');
  assert.ok(e4Move, 'e4 move must be available');

  const evalResult = evaluatePlayedMove(game.fen(), e4Move, 1);
  assert.equal(evalResult.san, 'e4');
  assert.ok(['best', 'excellent', 'good'].includes(evalResult.classification));
  assert.ok(evalResult.coachExplanation.length > 0);
});

test('calculateGameAccuracy computes valid percentage values', () => {
  const mockMoves = [
    { color: 'w' as const, evalDelta: 0 },
    { color: 'b' as const, evalDelta: -10 },
    { color: 'w' as const, evalDelta: 5 },
    { color: 'b' as const, evalDelta: -50 }
  ];
  const acc = calculateGameAccuracy(mockMoves as any);
  assert.ok(acc.white >= 80 && acc.white <= 100);
  assert.ok(acc.black >= 70 && acc.black <= 100);
});
