import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
const path = require('path');

const SILENT = Boolean(process.env.SILENT) ?? false
const SOURCE_MAP = Boolean(process.env.SOURCE_MAP) ?? false

export default defineConfig({
  root: process.cwd(),
  base: '/',
  publicDir: 'public',
  logLevel: SILENT ? 'error' : 'info',
  optimizeDeps: {
    include: [
      'vue'
    ]
  },
  resolve: {
    alias: [
      {
        find: '/@src/',
        replacement: `/src/`,
      },
    ],
  },
  build: {
    outDir: path.resolve(__dirname, '../../packages/native/windows/background'),
    minify: false,
    sourcemap: SOURCE_MAP,
    // Turning off brotliSize display can slightly reduce packaging time
    brotliSize: !SILENT,
    chunkSizeWarningLimit: Infinity,
    // minify: true,
    rollupOptions: {
      external: [/\/eftc\/.*/],
    },
  },
  plugins: [
    Vue({
      include: [/\.vue$/],
    }),
  ],
})
