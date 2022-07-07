import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import ViteFonts from 'vite-plugin-fonts'
import ViteRadar from 'vite-plugin-radar'
import PurgeIcons from 'vite-plugin-purge-icons'
import { imagetools } from 'vite-imagetools'
import ImageMin from 'vite-plugin-imagemin'
import purgecss from 'rollup-plugin-purgecss'
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
    outDir: path.resolve(__dirname, '../../packages/native/windows/desktop'),
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
    // ViteRadar({
    //   enableDev: true,
    //   gtm: {
    //     id: 'GTM-N9P6H6B',
    //   },
    // }),
    Components({
      dirs: ['src/components'],
      extensions: ['vue', 'md'],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    }),
    PurgeIcons(),
    ViteFonts({
      google: {
        families: [
          {
            name: 'Fira Code',
            styles: 'wght@400;600',
          },
          {
            name: 'Montserrat',
            styles: 'wght@500;600;700;800;900',
          },
          {
            name: 'Roboto',
            styles: 'wght@300;400;500;600;700',
          },
        ],
      },
    }),
    purgecss({
      content: [`./src/**/*.vue`],
      variables: false,
      safelist: {
        standard: [
          /(autv|lnil|lnir|fas?)/,
          /-(leave|enter|appear)(|-(to|from|active))$/,
          /^(?!(|.*?:)cursor-move).+-move$/,
          /^router-link(|-exact)-active$/,
          /data-v-.*/,
        ],
      },
      defaultExtractor(content) {
        const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '')
        return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || []
      },
    }),
    imagetools({
      silent: SILENT,
    }),
    ImageMin({
      verbose: !SILENT,
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 60,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
  ],
})
