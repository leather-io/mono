import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    // Port 3000 is what apps/extension/playwright.config.ts expects from its
    // host page, so this app serves the e2e suite as-is.
    port: 3000,
    strictPort: true,
    open: false,
  },
});
