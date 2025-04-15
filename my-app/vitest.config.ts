import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8', // ou 'istanbul'
      reporter: ['text', 'json', 'html'],
      all: true, // Inclut tous les fichiers, même ceux sans test
      include: ['src/**/*.{ts,tsx}'], // Cible les fichiers source dans 'src'
      exclude: ['node_modules', 'src/tests/*'], // Exclut les fichiers de test
    },
  },
});