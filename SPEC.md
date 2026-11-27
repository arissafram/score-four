# Score Four — spec

A browser game: 3D "connect four" on a 4×4 grid of 16 pegs, each peg holds up to 4 beads (4×4×4 = 64 cells).
Black and white alternate; a bead drops to the lowest free spot on the chosen peg. First to get 4 in a
line (any straight or diagonal line through the cube, 76 lines total) wins. Full board, no line = draw.

Fully frontend ES modules. Two ways to run it:
- **Standalone page** (`index.html`): static files, no build step; Three.js from a CDN via import map.
- **Package** (`score-four`, installed like react-jigsaw as a GitHub dependency with a committed `dist/`):
  React component `ScoreFour` and framework-free `mount(el, options)`, styles at `score-four/styles`.
  See "Package" below.
Keep files small and readable.

## Look
- Real 3D scene (Three.js), rendered at a tiny internal resolution (~240px tall) and scaled up with
  `image-rendering: pixelated` for a chunky retro look. Flat-shaded, low-poly, few colours:
  wood board, grey pegs, black beads, white beads, red highlight.
- Thin pegs, beads slightly smaller than the peg spacing so you can see through the grid.
- Drag to rotate (OrbitControls), scroll/pinch to zoom, camera can't go below the board.

## Screen layout (built by `app.js` inside the mount root)
All elements use `sf-` classes (no ids, so several boards can coexist) under a root with class `score-four`.
- Top bar: `.sf-status` (e.g. "White's turn", "Black wins!", "Draw", "Computer is thinking…").
- Left/main: `.sf-view` — container for the 3D canvas. Hint text "Drag to rotate · scroll or pinch to zoom".
- Right panel:
  - `.sf-minimap` — four 4×4 grids, one per layer (1 = bottom … 4 = top), seen from above.
  - Buttons `.sf-btn-top` (top-down view), `.sf-btn-reset` (reset camera), `.sf-btn-new` (new game).
  - Setup: `.sf-mode` select labelled Opponent (`2p` = Human, `cpu` = Computer); the computer always searches at the `hard` level; no level select.
    `.sf-first` select (`human`, `cpu` — who plays first vs computer; disabled when the opponent is Human).
  - `.sf-score` text: "Black 0 · White 0".
- When the root is narrower than 700px (container query, not viewport) the panel stacks under the view.

## Coordinates (shared by every file)
- Peg `(x, y)`, each 0–3. Peg index `peg = x + 4*y` (0–15).
- Height `z` 0–3, 0 = bottom.
- Cell index `cell = x + 4*y + 16*z` (0–63). So `peg = cell % 16`, `z = Math.floor(cell / 16)`.
- Players: `1` = black, `2` = white. **Black moves first.**
- In 3D: board lies in the X/Z plane of Three.js, peg (x, y) at world `((x-1.5)*S, 0, (y-1.5)*S)`,
  bead height z goes up world Y. Minimap: column = x, row = y.

## Files and interfaces
All files are ES modules.

### `game.js` — rules, no DOM, no Three.js (works in Node, browser and Web Worker)
```js
export const LINES;                 // array of 76 arrays, each 4 cell indices
export function cellIndex(x, y, z)  // -> cell
export function cellCoords(cell)    // -> {x, y, z}
export function createGame()        // -> state
// state = { cells: Array(64) of 0|1|2, heights: Array(16) of 0..4,
//           turn: 1|2, winner: 0|1|2, winLine: null | [4 cells],
//           draw: boolean, moves: [peg, ...] }
export function canDrop(state, peg)     // false if peg full or game over
export function drop(state, peg)        // mutates; -> cell placed, or -1 if illegal.
                                        // updates turn/winner/winLine/draw
export function undo(state)             // reverts last move
export function legalMoves(state)       // -> [peg, ...]
export function cloneGame(state)
```
Tests: `test/game.test.js`, run with `node --test` (there is a `package.json` with `"type": "module"`).

### `scene.js` — Three.js view only, knows nothing about rules
```js
export function createScene(container, { onPegClick(peg), onPegHover(peg | null) })
// -> api:
//   setBead(cell, player, animate = true)  // place a bead (drop animation if animate)
//   clearBeads()
//   setGhost(peg | null, z, player)        // dashed/transparent preview bead + peg highlight
//   flash(cells)                           // blink the winning beads until clearBeads()
//   topView()                              // smooth move to looking straight down
//   resetCamera()
//   destroy()                              // stop loop, dispose GPU resources, remove canvas
```
`import 'three'` / `'three/addons/...'`: standalone page resolves them with an import map in index.html:
`three` -> `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js`,
`three/addons/` -> `https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/`.
Clicking: invisible fat cylinder per peg as the raycast target. A drag (pointer moved > ~5px) is not a click.

### `minimap.js` — four small canvases
```js
export function createMinimap(container, { onPegClick(peg) })
// -> api: render(state, ghostPeg | null)   // draws beads, ghost, and winLine highlight
```

### `app.js` — `mount(root, { opponent = '2p', first = 'human', showTitle = true, createWorker })`
Builds the DOM in `root`, wires game + scene + minimap + buttons + status + score + computer player.
Returns `{ game, play(peg), newGame(), destroy() }`; `destroy()` terminates the worker, disposes the scene
and empties `root`.

### `main.js` — standalone entry: `window.scoreFour = mount(document.getElementById('app'))`.

### `react.js` — `<ScoreFour opponent first showTitle className style onReady />`, mounts in an effect,
destroys on unmount (StrictMode-safe). `index.js` is the package entry (exports `ScoreFour`, default, `mount`).

### `ai.js` — computer player, pure (imports game.js only)
```js
export const LEVELS = {
  easy:   { maxDepth: 2, mistake: 0.25 },
  medium: { maxDepth: 4, mistake: 0.05 },
  hard:   { timeMs: 1000 },
  expert: { timeMs: 3000 },
};
export function bestMove(state, options)  // -> peg. options = a LEVELS entry
```
Minimax with alpha-beta, iterative deepening within the time budget, move ordering (win, block,
centre first), transposition table, line-based evaluation (empty/own-only lines scored by bead count;
gravity-aware: a 3-in-line whose 4th cell is immediately playable is worth much more; never play
under an opponent's winning cell). Bitboards (BigInt or two 32-bit ints) are welcome if they help speed.

### `worker.js` — module Web Worker around ai.js
Message in: `{ state, level }` (level is a LEVELS key). Message out: `{ peg }`.
Created by `default-worker.js` with `new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })`.
The library build aliases it to `default-worker.lib.js`, which inlines the bundled worker (`?worker&inline`)
so host bundlers never have to locate a worker file inside node_modules.

Tests: `test/ai.test.js` (`node --test`): takes an immediate win, blocks an immediate loss,
hard beats easy in a short self-play match. Tests must finish in under ~60 s.

## Package
- `npm run build` (Vite library mode, `vite.config.js`) -> `dist/index.esm.js`, `dist/score-four.css`,
  plus hand-written types copied from `types/`. `dist/` is committed, like react-jigsaw, because hosts
  install from GitHub (`"score-four": "github:arissafram/score-four#main"`). Rebuild before committing.
- `three` is a dependency (external in the bundle, resolved by the host's bundler); `react` is an
  optional peer dependency (only needed for `ScoreFour`).
- CSS: every rule is under `.score-four`, variables are `--sf-*`. The root is `height: 100%`
  (min 520px), so the host sizes it by giving its container a height.
- Usage: `import { ScoreFour } from 'score-four'; import 'score-four/styles';`

## Running
Tests: `npm test`. Standalone: `python3 -m http.server 8080` from this folder (configured in `.claude/launch.json` as `score-four`).
Open http://localhost:8080.

## Working rules for build sessions
- Only touch the files your brief lists. Other sessions may be editing other files at the same time.
- Don't commit, don't switch branches.
- Verify cheaply: Node tests for logic; for UI, use page text / console errors, and at most one or two
  screenshots at the end.
