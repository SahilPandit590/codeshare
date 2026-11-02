import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // The monorepo keeps environment files at the repository root.
  envDir: path.resolve(__dirname, '..'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@codeshare/shared': path.resolve(__dirname, '../shared/types/paste.ts'),
      // Monaco 0.57 exposes worker files through package exports that do not
      // preserve Vite's ?worker query. Resolve the installed workspace copy
      // explicitly so Vite emits the workers as first-party assets.
      '@codeshare/monaco-editor-worker': path.resolve(
        __dirname,
        '../node_modules/monaco-editor/esm/vs/editor/editor.worker.js'
      ),
      '@codeshare/monaco-json-worker': path.resolve(
        __dirname,
        '../node_modules/monaco-editor/esm/vs/language/json/json.worker.js'
      ),
      '@codeshare/monaco-css-worker': path.resolve(
        __dirname,
        '../node_modules/monaco-editor/esm/vs/language/css/css.worker.js'
      ),
      '@codeshare/monaco-html-worker': path.resolve(
        __dirname,
        '../node_modules/monaco-editor/esm/vs/language/html/html.worker.js'
      ),
      '@codeshare/monaco-typescript-worker': path.resolve(
        __dirname,
        '../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js'
      ),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
