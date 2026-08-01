import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api/project-sheet': {
          target: 'https://docs.google.com/spreadsheets/d/1wTolxezKK_KAfaAwe8J8-7nw5mAQWB6-7qrvx4BnxNI',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/project-sheet/, '/export?format=csv&gid=1746107234'),
        },
        '/api/project-sheet-json': {
          target: 'https://docs.google.com/spreadsheets/d/1wTolxezKK_KAfaAwe8J8-7nw5mAQWB6-7qrvx4BnxNI',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/project-sheet-json/, '/gviz/tq?tqx=out:json&gid=1746107234'),
        },
        '/api/volume-sheet': {
          target: 'https://docs.google.com/spreadsheets/d/1mcnmLr92VJMsgIZbz1LeiVHMnI43pmB1Q6QOVVlYliA',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/volume-sheet/, '/export?format=csv&gid=1393425582'),
        },
        '/api/volume-sheet-json': {
          target: 'https://docs.google.com/spreadsheets/d/1mcnmLr92VJMsgIZbz1LeiVHMnI43pmB1Q6QOVVlYliA',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/volume-sheet-json/, '/gviz/tq?tqx=out:json&gid=1393425582'),
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
