// Mountable Score Four: builds its own DOM inside `root` and returns a handle with destroy().
// Everything is scoped under the `.score-four` class so several boards (or a host site) can coexist.
import { createGame, canDrop, drop } from './game.js';
import { createScene } from './scene.js';
import { createMinimap } from './minimap.js';
import defaultWorker from './default-worker.js';

const NAME = { 1: 'Black', 2: 'White' };

const TEMPLATE = `
<header class="sf-header">
  <h1 class="sf-wordmark">Score Four</h1>
  <div class="sf-status" role="status" aria-live="polite"></div>
</header>
<div class="sf-main">
  <section class="sf-view-wrap">
    <div class="sf-view"></div>
    <p class="sf-hint">Drag to rotate · scroll or pinch to zoom</p>
  </section>
  <aside class="sf-panel">
    <div class="sf-minimap"></div>
    <div class="sf-buttons">
      <button type="button" class="sf-btn-top">Top view</button>
      <button type="button" class="sf-btn-reset">Reset camera</button>
      <button type="button" class="sf-btn-new">New game</button>
    </div>
    <div class="sf-settings">
      <label>Opponent <select class="sf-mode"><option value="2p">Human</option><option value="cpu">Computer</option></select></label>
      <label>First <select class="sf-first"><option value="human">Human</option><option value="cpu">Computer</option></select></label>
    </div>
    <div class="sf-score"></div>
  </aside>
</div>`;

/**
 * @param {HTMLElement} root  element to render into (its contents are replaced)
 * @param {{ opponent?: '2p'|'cpu', first?: 'human'|'cpu', showTitle?: boolean, createWorker?: () => Worker }} [options]
 */
export function mount(root, options = {}) {
  const { opponent = '2p', first = 'human', showTitle = true, createWorker = defaultWorker } = options;
  root.classList.add('score-four');
  root.innerHTML = TEMPLATE;
  const $ = (name) => root.querySelector(`.sf-${name}`);
  if (!showTitle) $('wordmark').remove();
  $('mode').value = opponent;
  $('first').value = first;

  const score = { 1: 0, 2: 0 };
  let game = createGame();
  let hoverPeg = null;
  let thinking = false;
  let requestId = 0;
  let destroyed = false;

  const worker = createWorker();
  worker.onmessage = (e) => {
    if (destroyed || e.data.id !== requestId) return; // stale reply from a previous game
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
    if (destroyed) return false;
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

  // Computer player: called after every move (and on new game).
  function afterMove() {
    if (!cpuTurn()) return;
    thinking = true;
    const id = ++requestId;
    const state = JSON.parse(JSON.stringify(game));
    // one strength only: the timed 'hard' search (~1 s), which also lets the human's bead land
    worker.postMessage({ id, state, level: 'hard' });
  }

  function newGame() {
    if (destroyed) return;
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
  $('mode').onchange = newGame;
  $('first').onchange = newGame;
  refresh();
  afterMove(); // computer may move first

  return {
    get game() { return game; },
    play,
    newGame,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      worker.terminate();
      scene.destroy();
      root.innerHTML = '';
      root.classList.remove('score-four');
    },
  };
}
