import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      '@components': path.resolve(__dirname, './app/components'),
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    // 测试环境
    environment: 'jsdom',
    // 匹配 .spec.ts 结尾的测试文件
    include: ['**/*.spec.ts'],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
    },
  },
})
