import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
      all: true, // Include all files, even those without tests
      include: ['src/**/*.{ts,tsx}'], // Target source files in 'src'
      exclude: ['node_modules', 'src/tests/*'], // Exclude test files
      thresholds: {
        statements: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
});