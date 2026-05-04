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

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 120_000,
  expect: {
    timeout: 5_000,
  },

  use: {
    // 统一 midscene 和 playwright的分辨率 防止截断
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      // viewport 在 device 展开后显式覆盖，防止 Desktop Chrome 预设覆盖全局配置
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
})
