import { defineConfig } from 'vitest/config'
import path from 'node:path'
import swc from 'unplugin-swc'
export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.(t|j)s'],
    },
  },
  plugins: [swc.vite()], // 解决没有meta-data的问题
})
