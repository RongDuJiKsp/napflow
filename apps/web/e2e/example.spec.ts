import { expect, test } from '@playwright/test'

test('首页应正确重定向到 /bots', async ({ page }) => {
  await page.goto('/')

  // 根据 next.config.ts 中的 redirect 配置，/ 应该重定向到 /bots
  await expect(page).toHaveURL(/\/bots/)
})

test('页面应正常加载', async ({ page }) => {
  await page.goto('/bots')

  // 验证页面成功加载（没有出现错误页面）
  await expect(page).not.toHaveTitle(/Error/)
})
