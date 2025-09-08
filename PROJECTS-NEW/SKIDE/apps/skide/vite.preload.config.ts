import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  mode: 'development',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/preload/preload.ts'),
      formats: ['cjs'],
      fileName: () => 'preload.js'
    },
    outDir: 'dist/preload',
    rollupOptions: {
      external: ['electron'],
      output: {
        entryFileNames: 'preload.js'
      }
    },
    minify: false,
    sourcemap: true
  }
});
