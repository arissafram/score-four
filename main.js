import { createGame, canDrop, drop } from './game.js';
import { createScene } from './scene.js';
import { createMinimap } from './minimap.js';

const $ = (id) => document.getElementById(id);
const NAME = { 1: 'Black', 2: 'White' };
const score = { 1: 0, 2: 0 };
let game = createGame();
let hoverPeg = null;
let thinking = false;
let requestId = 0;
const worker = new Worker('./worker.js', { type: 'module' });
worker.onmessage = (e) => {
  if (e.data.id !== requestId) return; // stale reply from a previous game
  thinking = false;
  play(e.data.peg, true);
};

const vsCpu = () => $('mode').value === 'cpu';
const cpuPlayer = () => ($('first').value === 'cpu' ? 1 : 2);
const cpuTurn = () => vsCpu() && !game.winner && !game.draw && game.turn === cpuPlayer();

const scene = createScene($('view'), {
  onPegClick: play,
  onPegHover(peg) { hoverPeg = peg; refresh(); },
});
const minimap = createMinimap($('minimap'), { onPegClick: play });

function refresh() {
  const over = game.winner || game.draw;
  const showGhost = hoverPeg !== null && !over && !cpuTurn() && game.heights[hoverPeg] < 4;
  scene.setGhost(showGhost ? hoverPeg : null, showGhost ? game.heights[hoverPeg] : 0, game.turn);
  minimap.render(game, hoverPeg);
  const cpu = vsCpu();
  $('first').disabled = !cpu; // who goes first only matters against the computer
  $('status').textContent = game.winner
    ? (cpu ? (game.winner === cpuPlayer() ? 'Computer wins!' : 'You win!') : `${NAME[game.winner]} wins!`)
    : game.draw ? 'Draw'
    : cpuTurn() ? 'Computer is thinking…'
    : cpu ? `Your turn (${NAME[game.turn].toLowerCase()})` : `${NAME[game.turn]}'s turn`;
  $('score').textContent = `Black ${score[1]} · White ${score[2]}`;
}

// Human input entry point. Returns true if a bead was placed.
function play(peg, fromCpu = false) {
  if (!fromCpu && (thinking || cpuTurn())) return false;
  if (!canDrop(game, peg)) return false;
  const player = game.turn;
  const cell = drop(game, peg);
  if (cell < 0) return false;
  scene.setBead(cell, player);
  if (game.winner) {
    score[game.winner]++;
    scene.flash(game.winLine);
  }
  refresh();
  afterMove();
  return true;
}

// Hook for a computer player: called after every move (and on new game).
function afterMove() {
  if (!cpuTurn()) return;
  thinking = true;
  const id = ++requestId;
  const state = JSON.parse(JSON.stringify(game));
  // one strength only: the timed 'hard' search (~1 s), which also lets the human's bead land
  worker.postMessage({ id, state, level: 'hard' });
}

function newGame() {
  requestId++;
  thinking = false;
  game = createGame();
  scene.clearBeads();
  refresh();
  afterMove();
}

$('btn-top').onclick = () => scene.topView();
$('btn-reset').onclick = () => scene.resetCamera();
$('btn-new').onclick = newGame;
for (const id of ['mode', 'first']) $(id).onchange = newGame;
refresh();

window.scoreFour = { get game() { return game; }, play, newGame };
