import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

/** Builds the headless npm package from `src/index.ts` (ESM + CJS + types). */
export default defineConfig({
  publicDir: false,
  plugins: [
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.app.json',
      include: ['src/index.ts', 'src/**/*.ts'],
      exclude: ['**/*.spec.ts'],
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
  },
});
