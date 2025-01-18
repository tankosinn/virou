import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  resolve: command === 'build'
    ? {}
    : {
        alias: {
          '@virou/core': resolve(__dirname, '../../packages/core/src/index.ts'),
        },
      },
  build: {
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('@virou/'))
            return 'virou'
          else
            return 'vendor'
        },
      },
    },
  },
}))
