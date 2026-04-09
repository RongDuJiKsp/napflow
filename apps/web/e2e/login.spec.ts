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

  test('未输入邮箱被拦截', async ({ page }) => {
    await page.goto('http://localhost/login')
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page.locator('body')).toContainText('Validation Error')
    await expect(page.locator('body')).toContainText('✖ Invalid email address → at email')
  })

  test('输入的邮箱不合法', async ({ page }) => {
    await page.goto('http://localhost/login')
    await page.getByRole('textbox', { name: '邮箱地址' }).click()
    await page.getByRole('textbox', { name: '邮箱地址' }).fill('napflow.com')
    await page.getByRole('textbox', { name: '请输入密码' }).click()
    await page.getByRole('textbox', { name: '请输入密码' }).fill('1334')
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page.locator('body')).toContainText('✖ Invalid email address → at email')
  })

  test('未输入密码被拦截', async ({ page }) => {
    await page.goto('http://localhost/login')
    await page.getByRole('textbox', { name: '邮箱地址' }).click()
    await page.getByRole('textbox', { name: '请输入密码' }).click()
    await page.getByRole('button', { name: '登录' }).click()
    await page.getByText('✖ Password is required → at').click()
  })

  test('前端校验全部通过 但是用户不存在', async ({ page }) => {
    await page.goto('http://localhost/login')
    await page.getByRole('textbox', { name: '邮箱地址' }).click()
    await page.getByRole('textbox', { name: '邮箱地址' }).fill('riit@napflow.com')
    await page.getByRole('textbox', { name: '请输入密码' }).click()
    await page.getByRole('textbox', { name: '请输入密码' }).fill('134345')
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page.locator('body')).toContainText('用户不存在或密码错误')
  })
})
