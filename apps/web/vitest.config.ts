import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      '@components': path.resolve(__dirname, './app/components'),
      '@workflow': path.resolve(__dirname, './app/components/workflow'),
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['**/*.spec.ts'],
    exclude: ['**\/node_modules/**', '**\/.git/**', '**\/e2e/**'],
    coverage: {
      provider: 'v8',
    },
  },
})
