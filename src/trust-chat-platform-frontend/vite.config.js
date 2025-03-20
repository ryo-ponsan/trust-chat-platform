import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import vue from '@vitejs/plugin-vue';
import path from 'path';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  plugins: [
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "declarations": fileURLToPath(
        new URL("../declarations", import.meta.url)
      ),
    },
    dedupe: ['@dfinity/agent'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
  },
  publicDir: "assets",
});
