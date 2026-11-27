import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LINES, cellIndex, cellCoords, createGame, canDrop, drop, undo, legalMoves, cloneGame } from '../src/game.js';

const peg = (x, y) => x + 4 * y;
// Play a list of pegs; returns the state.
const play = (pegs, g = createGame()) => { for (const p of pegs) assert.notEqual(drop(g, p), -1, `drop ${p}`); return g; };
// Interleave: black plays `b`, white plays `w` (filler), alternately, black first.
const interleave = (b, w) => b.flatMap((p, i) => (i < w.length ? [p, w[i]] : [p]));
const sorted = (a) => [...a].sort((m, n) => m - n);

test('76 lines, each 4 distinct in-range cells, no duplicates', () => {
  assert.equal(LINES.length, 76);
  const keys = new Set();
  for (const l of LINES) {
    assert.equal(l.length, 4);
    assert.equal(new Set(l).size, 4);
    for (const c of l) assert.ok(Number.isInteger(c) && c >= 0 && c < 64);
    keys.add(sorted(l).join(','));
  }
  assert.equal(keys.size, 76);
});

test('cellIndex / cellCoords round-trip', () => {
  for (let c = 0; c < 64; c++) {
    const { x, y, z } = cellCoords(c);
    assert.equal(cellIndex(x, y, z), c);
  }
  assert.deepEqual(cellCoords(cellIndex(1, 2, 3)), { x: 1, y: 2, z: 3 });
});

test('gravity: beads stack, 5th drop is illegal', () => {
  const g = createGame();
  for (let z = 0; z < 4; z++) assert.equal(drop(g, 5), 5 + 16 * z);
  assert.equal(g.heights[5], 4);
  assert.equal(canDrop(g, 5), false);
  assert.equal(drop(g, 5), -1);
  assert.equal(g.moves.length, 4);
  assert.ok(!legalMoves(g).includes(5));
  assert.equal(legalMoves(g).length, 15);
});

test('turns alternate starting with black', () => {
  const g = createGame();
  assert.equal(g.turn, 1);
  const c0 = drop(g, 0); assert.equal(g.cells[c0], 1); assert.equal(g.turn, 2);
  const c1 = drop(g, 1); assert.equal(g.cells[c1], 2); assert.equal(g.turn, 1);
});

const expectWin = (g, cells) => {
  assert.equal(g.winner, 1);
  assert.deepEqual(sorted(g.winLine), sorted(cells));
  assert.equal(canDrop(g, 15), false);
  assert.equal(drop(g, 15), -1);
  assert.deepEqual(legalMoves(g), []);
};

test('win: vertical line', () => {
  const g = play(interleave([0, 0, 0, 0], [1, 1, 1]));
  expectWin(g, [0, 16, 32, 48]);
});

test('win: horizontal row', () => {
  const g = play(interleave([0, 1, 2, 3], [4, 5, 6]));
  expectWin(g, [0, 1, 2, 3]);
});

test('win: flat-layer diagonal', () => {
  const d = [peg(0, 0), peg(1, 1), peg(2, 2), peg(3, 3)];
  const g = play(interleave(d, [1, 2, 3]));
  expectWin(g, d);
});

test('win: vertical-plane diagonal (staircase)', () => {
  // Black at (0,0,0),(1,0,1),(2,0,2),(3,0,3); white fills under via other moves.
  const seq = [0, 1, 1, 2, 2, 3, 2, 3, 4, 3, 3];
  const g = play(seq);
  expectWin(g, [cellIndex(0, 0, 0), cellIndex(1, 0, 1), cellIndex(2, 0, 2), cellIndex(3, 0, 3)]);
});

test('win: full space diagonal corner to corner', () => {
  // Black at (0,0,0),(1,1,1),(2,2,2),(3,3,3).
  const a = peg(0, 0), b = peg(1, 1), c = peg(2, 2), d = peg(3, 3);
  const g = createGame();
  // B a0, W b0, B b1, W c0, B c1, W 1, B c2, W d0, B d1, W 2, B 1, W d2, B d3
  for (const p of [a, b, b, c, c, 1, c, d, d, 2, 1, d, d]) assert.notEqual(drop(g, p), -1);
  expectWin(g, [cellIndex(0, 0, 0), cellIndex(1, 1, 1), cellIndex(2, 2, 2), cellIndex(3, 3, 3)]);
});

const DRAW = [2,0,0,1,0,0,1,2,1,2,1,3,2,5,3,9,3,3,4,9,4,9,4,4,5,5,5,10,6,10,6,6,7,6,8,7,9,7,11,7,11,8,8,8,12,10,10,11,12,11,13,12,12,13,13,13,15,15,15,14,15,14,14,14];

test('draw detection', () => {
  const g = createGame();
  for (let i = 0; i < 64; i++) {
    assert.equal(g.draw, false);
    assert.notEqual(drop(g, DRAW[i]), -1);
  }
  assert.equal(g.winner, 0);
  assert.equal(g.draw, true);
  assert.deepEqual(legalMoves(g), []);
});

test('undo restores state exactly', () => {
  const g = play([0, 1, 5, 5]);
  const before = cloneGame(g);
  drop(g, 6);
  undo(g);
  assert.deepEqual(g, before);
  // undo a winning move
  const w = play(interleave([0, 1, 2], [4, 5, 6]));
  const pre = cloneGame(w);
  drop(w, 3);
  assert.equal(w.winner, 1);
  undo(w);
  assert.deepEqual(w, pre);
  // undo the drawing move
  const d = play(DRAW.slice(0, 63));
  const preD = cloneGame(d);
  drop(d, DRAW[63]);
  undo(d);
  assert.deepEqual(d, preD);
  // undo all the way back
  while (g.moves.length) undo(g);
  assert.deepEqual(g, createGame());
});

test('cloneGame is independent', () => {
  const g = play([0, 1]);
  const c = cloneGame(g);
  assert.deepEqual(c, g);
  drop(c, 2);
  assert.equal(g.moves.length, 2);
  assert.equal(g.cells[2], 0);
  assert.equal(g.heights[2], 0);
  assert.equal(g.turn, 1);
});
