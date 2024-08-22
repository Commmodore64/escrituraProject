import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const basenameProd = '/react-shadcn-starter/';


export default defineConfig(({ command }) => {
  const isProd = command === 'build';

  return {
    base: isProd ? basenameProd : '',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      global: 'globalThis',
    },
    server: {
      host: true, // Permite conexiones desde otras máquinas en la red
    },
  };
});
