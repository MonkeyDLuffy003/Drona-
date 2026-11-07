import test from 'node:test';
import assert from 'node:assert/strict';
import { identifyOpening } from './openingBook';

test('identifies Italian Game from 1. e4 e5 2. Nf3 Nc6 3. Bc4', () => {
  const result = identifyOpening(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5']);
  assert.equal(result.opening?.name, 'Italian Game');
  assert.equal(result.opening?.variation, 'Giuoco Piano');
  assert.equal(result.isInTheory, true);
});

test('identifies Sicilian Defense from 1. e4 c5', () => {
  const result = identifyOpening(['e4', 'c5']);
  assert.equal(result.opening?.name, 'Sicilian Defense');
  assert.ok(result.movesMatched >= 2);
});

test('identifies Queen\'s Gambit from 1. d4 d5 2. c4', () => {
  const result = identifyOpening(['d4', 'd5', 'c4']);
  assert.equal(result.opening?.name, 'Queen\'s Gambit');
});

test('detects deviation from theory when unusual move played', () => {
  const result = identifyOpening(['e4', 'e5', 'Nf3', 'h6']);
  assert.equal(result.isInTheory, false);
});
