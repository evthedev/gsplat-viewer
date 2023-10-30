import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.gltf', '**/*.splat'],
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'Gsplat Viewer',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // externalize deps that shouldn't be bundled
      external: ['react'],
      output: {
        globals: {
          vue: 'react',
        },
      },
    },
  },
});
