// Score Four rules. Pure: no DOM, no Three.js. See SPEC.md for coordinates.

export function cellIndex(x, y, z) { return x + 4 * y + 16 * z; }
export function cellCoords(cell) { return { x: cell % 4, y: Math.floor(cell / 4) % 4, z: Math.floor(cell / 16) }; }

const inRange = (v) => v >= 0 && v < 4;

// All 76 lines: every direction (one of each +/- pair) from every start where 4 cells fit.
export const LINES = (() => {
  const lines = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
    const first = dx || dy || dz;
    if (first <= 0) continue; // skip zero vector and the negated duplicates
    for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) for (let z = 0; z < 4; z++) {
      if (!inRange(x + 3 * dx) || !inRange(y + 3 * dy) || !inRange(z + 3 * dz)) continue;
      lines.push([0, 1, 2, 3].map((i) => cellIndex(x + i * dx, y + i * dy, z + i * dz)));
    }
  }
  return lines;
})();

const LINES_BY_CELL = Array.from({ length: 64 }, () => []);
for (const line of LINES) for (const c of line) LINES_BY_CELL[c].push(line);

export function createGame() {
  return { cells: Array(64).fill(0), heights: Array(16).fill(0), turn: 1, winner: 0, winLine: null, draw: false, moves: [] };
}

export function canDrop(state, peg) {
  return !state.winner && !state.draw && peg >= 0 && peg < 16 && state.heights[peg] < 4;
}

export function drop(state, peg) {
  if (!canDrop(state, peg)) return -1;
  const player = state.turn;
  const cell = peg + 16 * state.heights[peg];
  state.cells[cell] = player;
  state.heights[peg]++;
  state.moves.push(peg);
  for (const line of LINES_BY_CELL[cell]) {
    if (line.every((c) => state.cells[c] === player)) { state.winner = player; state.winLine = line.slice(); break; }
  }
  if (!state.winner && state.moves.length === 64) state.draw = true;
  state.turn = player === 1 ? 2 : 1;
  return cell;
}

export function undo(state) {
  if (!state.moves.length) return;
  const peg = state.moves.pop();
  const cell = peg + 16 * --state.heights[peg];
  state.turn = state.cells[cell];
  state.cells[cell] = 0;
  state.winner = 0;
  state.winLine = null;
  state.draw = false;
}

export function legalMoves(state) {
  const out = [];
  for (let p = 0; p < 16; p++) if (canDrop(state, p)) out.push(p);
  return out;
}

export function cloneGame(state) {
  return { ...state, cells: state.cells.slice(), heights: state.heights.slice(), winLine: state.winLine && state.winLine.slice(), moves: state.moves.slice() };
}
