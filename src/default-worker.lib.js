// Library-build replacement for default-worker.js (see vite.config.js): worker bundled inline.
import InlineWorker from './worker.js?worker&inline';

export default function createWorker() {
  return new InlineWorker();
}
