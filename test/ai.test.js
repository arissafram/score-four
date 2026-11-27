import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, drop, cloneGame } from '../src/game.js';
import { bestMove, LEVELS } from '../src/ai.js';

const play = (pegs) => { const g = createGame(); for (const p of pegs) assert.notEqual(drop(g, p), -1); return g; };
const FAST = { timeMs: 200 };

test('takes an immediate win (and does not mutate state)', () => {
  const g = play([0, 5, 1, 6, 2, 9]); // black has pegs 0,1,2 on the bottom row
  const before = cloneGame(g);
  for (const lvl of [LEVELS.easy, LEVELS.medium, FAST]) assert.equal(bestMove(g, lvl), 3);
  assert.deepEqual(g, before);
});

test('blocks an immediate loss', () => {
  const g = play([0, 4, 1, 5, 10, 6]); // white threatens peg 7
  for (const lvl of [LEVELS.easy, LEVELS.medium, FAST]) assert.equal(bestMove(g, lvl), 7);
});

test('does not play under an opponent winning cell', () => {
  // White holds (0,0,1),(1,0,1),(2,0,1); (3,0,1) is empty and peg 3 is empty.
  const g = play([0, 0, 1, 1, 10, 2, 13, 2]);
  assert.equal(g.turn, 1);
  assert.notEqual(bestMove(g, FAST), 3);
  for (let i = 0; i < 30; i++) assert.notEqual(bestMove(g, LEVELS.easy), 3);
});

test('hard beats easy in self-play', () => {
  // Black (first player) has a real edge in Score Four, so allow the odd loss as white.
  const hard = { timeMs: 150 };
  let hardWins = 0, easyWins = 0;
  for (let game = 0; game < 6; game++) {
    const hardIs = game % 2 ? 2 : 1;
    const g = createGame();
    while (!g.winner && !g.draw) {
      const peg = bestMove(g, g.turn === hardIs ? hard : LEVELS.easy);
      assert.notEqual(drop(g, peg), -1);
    }
    if (g.winner === hardIs) hardWins++; else if (g.winner) easyWins++;
  }
  assert.ok(hardWins >= 4 && hardWins > 2 * easyWins, `hard ${hardWins} easy ${easyWins}`);
});
