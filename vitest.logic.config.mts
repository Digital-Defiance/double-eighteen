import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Minimal ESM-loaded config for the pure-logic unit tests (layout math and
// validators). Avoids the Vite/React plugin pipeline so it sidesteps the
// vitest1/vite7 config-loader mismatch in the inferred Nx target.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    // Pure-logic specs only (.ts). Component specs (.tsx) need the jsdom/React
    // pipeline and run via the standard Nx vitest target.
    include: ['src/**/*.spec.ts'],
  },
});
