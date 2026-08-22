import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Automatically determine base path:
  // 1. Explicit VITE_BASE_PATH if provided
  // 2. Extracted GitHub repo subpath if running in GitHub Actions (e.g. /my-repo/)
  // 3. Clean relative base './' for universal compatibility across static hosts & subdirectories
  const derivedBase = process.env.VITE_BASE_PATH || 
    (process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : './');

  return {
    base: derivedBase,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'spa-404-fallback',
        closeBundle() {
          const distPath = path.resolve(__dirname, 'dist');
          const indexPath = path.join(distPath, 'index.html');
          const notFoundPath = path.join(distPath, '404.html');
          if (fs.existsSync(indexPath) && !fs.existsSync(notFoundPath)) {
            fs.copyFileSync(indexPath, notFoundPath);
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
