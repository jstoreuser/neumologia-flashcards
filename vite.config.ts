import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Suppress warning for DOMPurify — known tradeoff for security boundary
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      // Multi-page app: each HTML file gets its own entry bundle
      input: {
        main: path.resolve(__dirname, 'index.html'),
        login: path.resolve(__dirname, 'login.html'),
        admin: path.resolve(__dirname, 'admin.html'),
      },
      output: {
        manualChunks: (id) => {
          // Firebase SDK — large but shared across all pages
          if (id.includes('node_modules/firebase')) return 'firebase';
          // Lit — component runtime
          if (id.includes('node_modules/lit') || id.includes('node_modules/@lit')) return 'lit';
          // DOMPurify — security library, goes in its own chunk
          if (id.includes('node_modules/dompurify')) return 'dompurify';
          // Zod — validation runtime
          if (id.includes('node_modules/zod')) return 'zod';
        },
      },
    },
  },
});
