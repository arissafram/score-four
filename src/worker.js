// Module Web Worker: { state, level } -> { peg }
import { bestMove, LEVELS } from './ai.js';

self.onmessage = (e) => {
  const { id, state, level } = e.data;
  self.postMessage({ id, peg: bestMove(state, LEVELS[level] || LEVELS.medium) });
};
