/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// El sistema de diseño se referencia desde su ubicación original, sin copiarlo (design.md D2).
const designSystem = fileURLToPath(new URL('../design-system', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@design-system': designSystem },
  },
  server: {
    port: 5173,
    strictPort: true,
    // Permite servir design-system/ (fuera de frontend/) solo en desarrollo.
    fs: { allow: ['..'] },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
