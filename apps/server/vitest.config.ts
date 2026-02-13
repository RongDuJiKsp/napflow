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
    // 测试环境
    environment: 'node',
    // 匹配 .spec.ts 和 .e2e-spec.ts 结尾的测试文件
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      include: ['src/**/*.(t|j)s'],
    },
    // 全局 API（describe, it, expect 等）
    globals: true,
  },
  plugins: [swc.vite()],
})
