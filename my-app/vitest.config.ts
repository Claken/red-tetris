import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    'import.meta.env.VITE_SERVER_URL': JSON.stringify('http://localhost:3000'),
  },
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8', // ou 'istanbul'
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'], // Cible les fichiers source dans 'src'
      exclude: ['node_modules', 'src/tests/*'], // Exclut les fichiers de test
    },
  },
});