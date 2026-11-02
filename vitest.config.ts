import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'backend',
          environment: 'node',
          include: ['tests/api/**/*.test.ts', 'tests/unit/**/*.test.ts'],
          alias: {
            '@codeshare/shared': path.resolve(__dirname, './shared/types/paste.ts'),
          },
        },
      },
      {
        test: {
          name: 'frontend',
          environment: 'jsdom',
          include: ['tests/frontend/**/*.{test.ts,test.tsx}'],
          alias: {
            '@codeshare/shared': path.resolve(__dirname, './shared/types/paste.ts'),
            '@': path.resolve(__dirname, './frontend/src'),
          },
        },
      },
    ],
  },
});
