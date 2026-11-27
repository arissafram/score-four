import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Two library builds into dist/:
// - `vite build`: dist/index.esm.js + dist/score-four.css for bundlers. three and react stay
//   external (declared as dependency / optional peer dependency).
// - `vite build --mode standalone`: dist/score-four.js, one file with three bundled, for a plain
//   <script type="module"> with no bundler. It only registers <score-four>.
export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone';
  return {
    resolve: {
      // Inline the AI worker so host bundlers never resolve a separate worker file in node_modules
      alias: [{ find: /^\.\/default-worker\.js$/, replacement: resolve(import.meta.dirname, 'src/default-worker.lib.js') }],
    },
    build: {
      emptyOutDir: !standalone,
      lib: {
        entry: resolve(import.meta.dirname, standalone ? 'src/element.js' : 'src/index.js'),
        formats: ['es'],
        fileName: () => (standalone ? 'score-four.js' : 'index.esm.js'),
        cssFileName: 'score-four',
      },
      rollupOptions: {
        external: standalone ? [] : (id) => id === 'react' || id === 'three' || id.startsWith('three/'),
      },
      cssCodeSplit: false,
    },
    worker: { format: 'es' },
  };
});
