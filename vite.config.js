import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json' with { type: 'json' };
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, 'popup.html'),
        clock: resolve(import.meta.dirname, 'clock.html'),
        reminder: resolve(import.meta.dirname, 'reminder.html'),
      },
    },
  },
});
