// backend/vitest.config.js
// Vitest configuration cho backend tests
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['workers/__tests__/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'workers/__tests__/**',
        'scripts/**',
      ],
    },
  },
});

