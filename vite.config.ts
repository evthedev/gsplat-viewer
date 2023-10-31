import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL),
  },
  assetsInclude: ['**/*.gltf', '**/*.splat'],
  plugins: [react()],
  build: {
    // lib: {
    //   entry: path.resolve(__dirname, 'main.'),
    //   name: 'Gsplat Viewer',
    //   // formats: ['es', 'umd'],
    // },
    assetsDir: './',
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.tsx'),
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
  worker: {
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
});
