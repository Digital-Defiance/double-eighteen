import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

/** Builds the npm package from `src/index.ts` (ESM + CJS + types). */
export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.app.json',
      include: ['src/index.ts', 'src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'src/main.tsx',
        'src/app/app.tsx',
        'src/app/app.spec.tsx',
        'src/app/Demo.tsx',
        'src/app/PipPatternHarness.tsx',
        'src/app/nx-welcome.tsx',
        'src/app/harness/**',
      ],
      rollupTypes: false,
      insertTypesEntry: true,
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'double-eighteen',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
