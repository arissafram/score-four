// Score Four computer player. Pure: imports game.js only (for LINES).
// Negamax + alpha-beta, iterative deepening, transposition table, gravity-aware line evaluation.
import { LINES } from './game.js';

export const LEVELS = {
  easy:   { maxDepth: 2, mistake: 0.25 },
  medium: { maxDepth: 4, mistake: 0.05 },
  hard:   { timeMs: 1000 },
  expert: { timeMs: 3000 },
};

const NL = LINES.length;
const WIN = 1000000;
const MATE = WIN - 100; // |score| above this = forced win/loss
const LINE_CELLS = Int8Array.from(LINES.flat());
const CELL_LINES = Array.from({ length: 64 }, () => []);
LINES.forEach((l, i) => l.forEach((c) => CELL_LINES[c].push(i)));
const CELL_LINES_T = CELL_LINES.map((a) => Int8Array.from(a));
// Static peg preference: number of lines through the bottom cell (corners and centre = 7).
const PEG_WEIGHT = Array.from({ length: 16 }, (_, p) => CELL_LINES[p].length);

// Zobrist keys (deterministic xorshift).
let seed = 0x9e3779b9;
const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed >>> 0; };
const Z1 = new Uint32Array(64 * 3).map(rnd), Z2 = new Uint32Array(64 * 3).map(rnd);

// Transposition table.
const TT_BITS = 20, TT_SIZE = 1 << TT_BITS, TT_MASK = TT_SIZE - 1;
const ttKey = new Uint32Array(TT_SIZE), ttScore = new Int32Array(TT_SIZE);
const ttDepth = new Int8Array(TT_SIZE), ttFlag = new Uint8Array(TT_SIZE), ttMove = new Int8Array(TT_SIZE);
const EXACT = 1, LOWER = 2, UPPER = 3;

// Search state (rebuilt each bestMove call).
const cells = new Uint8Array(64), heights = new Uint8Array(16);
const cnt = [null, new Uint8Array(NL), new Uint8Array(NL)];
const history = [null, new Int32Array(16), new Int32Array(16)];
let side = 1, filled = 0, h1 = 0, h2 = 0, nodes = 0, deadline = Infinity;
const ABORT = {};

function make(peg) {
  const cell = peg + 16 * heights[peg]++;
  cells[cell] = side;
  const c = cnt[side], ls = CELL_LINES_T[cell];
  for (let i = 0; i < ls.length; i++) c[ls[i]]++;
  h1 ^= Z1[cell * 3 + side]; h2 ^= Z2[cell * 3 + side];
  side = 3 - side; filled++;
}
function unmake(peg) {
  side = 3 - side; filled--;
  const cell = peg + 16 * --heights[peg];
  cells[cell] = 0;
  const c = cnt[side], ls = CELL_LINES_T[cell];
  for (let i = 0; i < ls.length; i++) c[ls[i]]--;
  h1 ^= Z1[cell * 3 + side]; h2 ^= Z2[cell * 3 + side];
}
// Would `p` complete a line by occupying (empty) `cell`?
function isWinCell(p, cell) {
  const a = cnt[p], b = cnt[3 - p], ls = CELL_LINES_T[cell];
  for (let i = 0; i < ls.length; i++) if (a[ls[i]] === 3 && b[ls[i]] === 0) return true;
  return false;
}
// Playing `peg` would let the opponent win on the cell directly above.
const isSuicidal = (peg) => heights[peg] < 3 && isWinCell(3 - side, peg + 16 * (heights[peg] + 1));

// Static evaluation from the side to move's point of view.
const W = [0, 2, 12, 0];
const threatMark = new Uint8Array(64); // bit 1 = side to move threatens cell, bit 2 = opponent
function evaluate() {
  const p = side, a = cnt[p], b = cnt[3 - p];
  let s = 0;
  threatMark.fill(0);
  for (let l = 0; l < NL; l++) {
    const x = a[l], y = b[l];
    if (x && y) continue;
    const n = x || y;
    if (n < 3) { s += x ? W[n] : -W[n]; continue; }
    let e = 0;
    for (let k = l * 4; k < l * 4 + 4; k++) if (!cells[LINE_CELLS[k]]) { e = LINE_CELLS[k]; break; }
    const bit = x ? 1 : 2;
    if (threatMark[e] & bit) continue; // same cell already counted for this player
    threatMark[e] |= bit;
    const who = x ? p : 3 - p, z = e >> 4;
    let v;
    if (heights[e & 15] === z) v = x ? 500 : 120; // playable right now
    // Zugzwang parity: white can always answer on top ("claim even"), so white owns z = 1, 3 and
    // black's threats only bite on z = 0, 2.
    else v = (z & 1) === (who === 1 ? 0 : 1) ? 250 : 50;
    s += x ? v : -v;
  }
  // Two stacked threats of one player on a peg: whoever fills below hands over the win.
  for (let c = 0; c < 48; c++) {
    const m = threatMark[c] & threatMark[c + 16];
    if (m & 1) s += 300;
    if (m & 2) s -= 300;
  }
  return s;
}

const winCellsBuf = new Int8Array(16);
function negamax(depth, alpha, beta, ply) {
  if ((++nodes & 2047) === 0 && Date.now() > deadline) throw ABORT;
  const p = side, o = 3 - p;
  // Immediate win / forced block.
  let threats = 0, forced = -1;
  for (let peg = 0; peg < 16; peg++) {
    if (heights[peg] > 3) continue;
    const cell = peg + 16 * heights[peg];
    if (isWinCell(p, cell)) return WIN - ply - 1;
    if (isWinCell(o, cell)) { threats++; forced = peg; }
  }
  if (threats > 1) return -(WIN - ply - 2);
  if (filled === 64) return 0;
  if (threats === 1) { // forced move: extend, don't count depth
    make(forced);
    const s = -negamax(depth, -beta, -alpha, ply + 1);
    unmake(forced);
    return s;
  }
  if (depth <= 0) return evaluate();

  const alpha0 = alpha;
  const idx = h1 & TT_MASK;
  let ttBest = -1;
  if (ttKey[idx] === h2 && ttFlag[idx]) {
    ttBest = ttMove[idx];
    if (ttDepth[idx] >= depth) {
      let s = ttScore[idx];
      if (s > MATE) s -= ply; else if (s < -MATE) s += ply;
      const f = ttFlag[idx];
      if (f === EXACT) return s;
      if (f === LOWER && s > alpha) alpha = s;
      else if (f === UPPER && s < beta) beta = s;
      if (alpha >= beta) return s;
    }
  }

  // Generate & order moves; drop suicidal moves unless nothing else.
  const moves = [], keys = [];
  let anySafe = false;
  for (let peg = 0; peg < 16; peg++) if (heights[peg] < 4 && !isSuicidal(peg)) anySafe = true;
  for (let peg = 0; peg < 16; peg++) {
    if (heights[peg] > 3 || (anySafe && isSuicidal(peg))) continue;
    moves.push(peg);
    keys.push(peg === ttBest ? 1e9 : history[p][peg] + PEG_WEIGHT[peg]);
  }
  for (let i = 1; i < moves.length; i++) { // insertion sort, descending key
    const m = moves[i], k = keys[i];
    let j = i - 1;
    while (j >= 0 && keys[j] < k) { moves[j + 1] = moves[j]; keys[j + 1] = keys[j]; j--; }
    moves[j + 1] = m; keys[j + 1] = k;
  }

  let best = -Infinity, bestMove = moves[0];
  for (let i = 0; i < moves.length; i++) {
    make(moves[i]);
    const s = -negamax(depth - 1, -beta, -alpha, ply + 1);
    unmake(moves[i]);
    if (s > best) { best = s; bestMove = moves[i]; }
    if (s > alpha) alpha = s;
    if (alpha >= beta) { history[p][moves[i]] += depth * depth; break; }
  }

  let st = best;
  if (st > MATE) st += ply; else if (st < -MATE) st -= ply;
  ttKey[idx] = h2; ttScore[idx] = st; ttDepth[idx] = depth; ttMove[idx] = bestMove;
  ttFlag[idx] = best <= alpha0 ? UPPER : best >= beta ? LOWER : EXACT;
  return best;
}

function load(state) {
  cells.fill(0); heights.fill(0); cnt[1].fill(0); cnt[2].fill(0);
  history[1].fill(0); history[2].fill(0);
  h1 = h2 = 0; filled = 0;
  for (let c = 0; c < 64; c++) {
    const v = state.cells[c];
    if (!v) continue;
    cells[c] = v; filled++;
    for (const l of CELL_LINES[c]) cnt[v][l]++;
    h1 ^= Z1[c * 3 + v]; h2 ^= Z2[c * 3 + v];
  }
  for (let p = 0; p < 16; p++) heights[p] = state.heights[p];
  side = state.turn;
}

export let lastSearch = { depth: 0, score: 0, nodes: 0 }; // diagnostics

// -> peg (or -1 if no legal move). Never mutates `state`.
export function bestMove(state, options = LEVELS.hard) {
  if (state.winner || state.draw) return -1;
  load(state);
  const p = side, o = 3 - p;
  const legal = [];
  for (let peg = 0; peg < 16; peg++) if (heights[peg] < 4) legal.push(peg);
  if (!legal.length) return -1;
  lastSearch = { depth: 0, score: 0, nodes: 0 };

  // Trivial cases: win now, or block the only threat.
  for (const peg of legal) if (isWinCell(p, peg + 16 * heights[peg])) return peg;
  const blocks = legal.filter((peg) => isWinCell(o, peg + 16 * heights[peg]));
  if (blocks.length) return blocks[0];
  const safe = legal.filter((peg) => !isSuicidal(peg));
  const rootMoves = safe.length ? safe : legal;
  if (rootMoves.length === 1) return rootMoves[0];

  if (options.mistake && Math.random() < options.mistake) {
    return rootMoves[Math.floor(Math.random() * rootMoves.length)];
  }

  ttFlag.fill(0);
  nodes = 0;
  const maxDepth = Math.min(options.maxDepth ?? 64, 64 - filled);
  deadline = options.timeMs ? Date.now() + options.timeMs : Infinity;
  const scores = new Map(rootMoves.map((m) => [m, PEG_WEIGHT[m]]));
  let best = rootMoves.slice().sort((a, b) => scores.get(b) - scores.get(a))[0];

  for (let depth = 1; depth <= maxDepth; depth++) {
    const order = rootMoves.slice().sort((a, b) => scores.get(b) - scores.get(a));
    let alpha = -Infinity, iterBest = order[0], iterScore = -Infinity;
    try {
      for (const m of order) {
        make(m);
        const s = -negamax(depth - 1, -Infinity, -alpha, 1);
        unmake(m);
        scores.set(m, s);
        if (s > iterScore) { iterScore = s; iterBest = m; }
        if (s > alpha) alpha = s;
      }
    } catch (e) {
      if (e !== ABORT) throw e;
      // Partial iteration: the previous best is searched first, so any move that beat it is better.
      if (iterScore > -Infinity) best = iterBest;
      break;
    }
    best = iterBest;
    lastSearch = { depth, score: iterScore, nodes };
    if (Math.abs(iterScore) > MATE) break; // forced result found
  }
  lastSearch.nodes = nodes;
  return best;
}
