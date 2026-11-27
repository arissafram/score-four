import type { CSSProperties, ReactElement } from 'react';

export interface ScoreFourState {
  cells: number[];
  heights: number[];
  turn: 1 | 2;
  winner: 0 | 1 | 2;
  winLine: number[] | null;
  draw: boolean;
  moves: number[];
}

export interface ScoreFourOptions {
  /** Starting opponent: '2p' (human vs human, default) or 'cpu'. */
  opponent?: '2p' | 'cpu';
  /** Who moves first against the computer (default 'human'). */
  first?: 'human' | 'cpu';
  /** Show the "Score Four" wordmark in the header (default true). */
  showTitle?: boolean;
  /** Override how the AI worker is created. */
  createWorker?: () => Worker;
}

export interface ScoreFourHandle {
  readonly game: ScoreFourState;
  /** Drop a bead on peg 0–15; returns true if placed. */
  play(peg: number): boolean;
  newGame(): void;
  /** Stop rendering, terminate the worker and empty the root element. */
  destroy(): void;
}

export function mount(root: HTMLElement, options?: ScoreFourOptions): ScoreFourHandle;

export interface ScoreFourProps extends Omit<ScoreFourOptions, 'createWorker'> {
  className?: string;
  style?: CSSProperties;
  onReady?: (handle: ScoreFourHandle) => void;
}

export function ScoreFour(props: ScoreFourProps): ReactElement;
export default ScoreFour;

/** `<score-four opponent="cpu" first="human" show-title="false">`. Registered on import. */
export class ScoreFourElement extends HTMLElement {
  /** The mount() handle, or null before it is connected. */
  readonly game: ScoreFourHandle | null;
}

declare global {
  interface HTMLElementTagNameMap {
    'score-four': ScoreFourElement;
  }
}
