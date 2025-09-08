import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  mode: 'development',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main/main.ts'),
      formats: ['cjs'],
      fileName: () => 'main.js'
    },
    outDir: 'dist/main',
    rollupOptions: {
      external: ['electron', 'path', '@kodii/core', '@skide/chat-threads', '@skide/project-brain', '@skide/db-layer'],
      output: {
        entryFileNames: 'main.js'
      }
    },
    minify: false,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
