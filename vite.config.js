import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Library build, mirroring react-jigsaw: committed dist/ consumed as a GitHub dependency.
// three and react stay external (declared as dependency / peer dependency).
export default defineConfig({
  resolve: {
    alias: [{ find: /^\.\/default-worker\.js$/, replacement: resolve(import.meta.dirname, 'default-worker.lib.js') }],
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'index.js'),
      formats: ['es'],
      fileName: () => 'index.esm.js',
      cssFileName: 'score-four',
    },
    rollupOptions: {
      external: (id) => id === 'react' || id === 'three' || id.startsWith('three/'),
    },
    cssCodeSplit: false,
  },
  worker: { format: 'es' },
});
