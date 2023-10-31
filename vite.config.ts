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
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'Gsplat Viewer',
      formats: ['es', 'umd'],
    },
  },
});
