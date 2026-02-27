import { test as base } from '@playwright/test'
import type { PlayWrightAiFixtureType } from '@midscene/web/playwright'
import { PlaywrightAiFixture } from '@midscene/web/playwright'

export const testAi = base.extend<PlayWrightAiFixtureType>(
  PlaywrightAiFixture({
    waitForNetworkIdleTimeout: 2000, // 可选, 交互过程中等待网络空闲的超时时间, 默认值为 2000ms, 设置为 0 则禁用超时
  }),
)
