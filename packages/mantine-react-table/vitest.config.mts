import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const shared = {
  environment: 'happy-dom',
  setupFiles: ['./src/__test__/setup.ts'],
};

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: {
          ...shared,
          exclude: ['src/**/*.compiled.test.tsx'],
          include: ['src/**/*.test.{ts,tsx}'],
          name: 'unit',
        },
      },
      {
        //compile only the test files and fixtures with the React Compiler, like a
        //consumer's build does; the library source in src/ stays uncompiled, the way
        //a consumer's compiler skips node_modules
        plugins: [
          react(),
          babel({
            include: [/\/src\/__test__\//],
            presets: [reactCompilerPreset({ compilationMode: 'infer' })],
          }),
        ],
        test: {
          ...shared,
          include: ['src/**/*.compiled.test.tsx'],
          name: 'compiled',
        },
      },
    ],
  },
});
