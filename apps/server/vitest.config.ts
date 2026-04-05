import { defineConfig } from 'vitest/config'
import path from 'node:path'
import swc from 'unplugin-swc'
import dotenv from 'dotenv'

// e2e 测试需要加载环境变量
const envFiles = [
  '.env.development.local',
  '.env.development',
  '.env.local',
  '.env',
]
for (const file of envFiles)
  dotenv.config({ path: path.resolve(__dirname, file), override: false })

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      '@': path.resolve(__dirname, './'),
      '@apps': path.resolve(__dirname, './src/apps'),
      '@runtime': path.resolve(__dirname, './src/apps/runtime'),
    },
  },
  test: {
    environment: 'node',
    include: [
      'src/**/*.spec.ts',
      'test/**/*.e2e-spec.ts',
      'test/**/*.-spec.ts',
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.(t|j)s'],
    },
  },
  plugins: [swc.vite()], // 解决没有meta-data的问题
})
