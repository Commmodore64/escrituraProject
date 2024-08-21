import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const basenameProd = '/react-shadcn-starter';

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
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return;
          }
          warn(warning);
        },
        commonjsOptions: {
          include: /node_modules/,
        },
        external: ['axios'],
      },
    },
  };
});
