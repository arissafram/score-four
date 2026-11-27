// How the AI worker is created. The standalone page uses this file as-is (a real module file next
// to the page); the library build swaps in default-worker.lib.js, which inlines the worker so host
// bundlers never have to resolve a separate worker file inside node_modules.
export default function createWorker() {
  return new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
}
