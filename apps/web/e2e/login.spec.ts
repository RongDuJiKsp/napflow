import { expect } from '@playwright/test'
import { testAi as test } from './base/midscene'

test.describe('登录页面', () => {
  test('login 页面正常登录流程', async ({ page }) => {
    await page.goto('http://localhost/login')
    await page.getByRole('textbox', { name: '邮箱地址' }).click()
    await page
      .getByRole('textbox', { name: '邮箱地址' })
      .fill('root@napflow.com')
    await page.getByRole('textbox', { name: '请输入密码' }).click()
    await page.getByRole('textbox', { name: '请输入密码' }).fill('root')
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page.getByRole('paragraph')).toContainText(
      '点击开始配置您的聊天机器人',
    )
    await expect(page.getByRole('main')).toContainText(
      '创建新Bot点击开始配置您的聊天机器人',
    )
    await expect(page.locator('h1')).toContainText('NapFlow')
    await expect(page.getByRole('navigation')).toContainText('机器人')
    await expect(page.getByRole('navigation')).toContainText('工作流')
    await expect(page.getByRole('navigation')).toContainText('健康面板')
    await expect(page.locator('#headlessui-menu-button-_r_k_')).toContainText(
      'root',
    )
  })
})
