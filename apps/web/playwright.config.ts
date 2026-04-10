import path from 'node:path'
import dotenv from 'dotenv'
import { defineConfig, devices } from '@playwright/test'

const envFiles = [
  '.env.e2e.local',
  '.env.e2e',
  '.env.development.local',
  '.env.development',
  '.env.local',
  '.env',
]

for (const file of envFiles)
  dotenv.config({ path: path.resolve(process.cwd(), file), override: false })

/**
 * Playwright E2E 测试配置
 * 适配 Next.js 项目，测试文件位于 ./e2e 目录
 */
export default defineConfig({
  testDir: './e2e',
  /* 测试文件匹配模式 */
  testMatch: '**/*.spec.ts',
  /* 并行运行测试文件 */
  fullyParallel: true,
  /* CI 环境下禁止 test.only */
  forbidOnly: !!process.env.CI,
  /* CI 环境下失败重试 2 次 */
  retries: process.env.CI ? 2 : 0,
  /* CI 环境下使用单 worker，本地并行 */
  workers: process.env.CI ? 1 : undefined,
  /* 测试报告 */
  reporter: process.env.CI ? 'github' : 'html',
  /* 全局超时：单个测试最多 120 秒 */
  timeout: 120_000,
  /* expect 断言超时 */
  expect: {
    timeout: 5_000,
  },

  /* 所有项目的公共配置 */
  use: {
    /* 统一 midscene 和 playwright的分辨率 防止截断 */
    viewport: { width: 1920, height: 1080 },
    /* 失败时自动截图 */
    screenshot: 'only-on-failure',
    /* 首次重试时收集 trace */
    trace: 'on-first-retry',
    /* 失败时录制视频 */
    video: 'on-first-retry',
  },

  /* 浏览器项目配置 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // 如需测试多浏览器，取消以下注释
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
})
