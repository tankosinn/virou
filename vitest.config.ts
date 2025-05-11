import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@virou/core': resolve(import.meta.dirname, 'packages/core/src/index.ts'),
    },
  },
  test: {
    coverage: {
      exclude: [
        'playgrounds/**',
        'scripts/**',
        '**/dist/**',
        ...coverageConfigDefaults.exclude,
      ],
    },
    workspace: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'happy-dom',
        },
      },
    ],
  },
})
