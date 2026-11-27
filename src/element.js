// <score-four opponent="2p|cpu" first="human|cpu" show-title="false"></score-four>
// Light DOM (so page scrolling from swipes works as with mount()). Its CSS is added to the
// page, or to the shadow root it sits in, once. Defaults to 100% wide and 640px tall; size it with CSS.
import css from './style.css?inline';
import { mount } from './app.js';

const STYLE_ID = 'score-four-styles';
const HOST_CSS = 'score-four.score-four{height:640px}score-four.score-four[hidden]{display:none}';

function addStyles(node) {
  const root = node.getRootNode();
  const target = root instanceof ShadowRoot ? root : document.head;
  if (target.querySelector(`#${STYLE_ID}`)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = HOST_CSS + css;
  target.appendChild(style);
}

export class ScoreFourElement extends HTMLElement {
  connectedCallback() {
    if (this._game) return; // moved within the page: keep the game
    addStyles(this);
    this._game = mount(this, {
      opponent: this.getAttribute('opponent') || undefined,
      first: this.getAttribute('first') || undefined,
      showTitle: this.getAttribute('show-title') !== 'false',
    });
  }

  disconnectedCallback() {
    // Wait a tick: a remove + re-insert (a move) shouldn't restart the game
    queueMicrotask(() => {
      if (this.isConnected || !this._game) return;
      this._game.destroy();
      this._game = null;
    });
  }

  /** The mount() handle: game, play(peg), newGame(). */
  get game() { return this._game || null; }
}

if (!customElements.get('score-four')) customElements.define('score-four', ScoreFourElement);
