import { expect } from '@playwright/test'
import { testAi as test } from './base/midscene'
import { getToken } from './utils/token'

test.describe('创建 Bot', () => {
  test('配置 Napcat Ws 并成功创建 Bot', async ({ page, request, aiInput, aiTap, aiAssert }) => {
    const botName = `midscene-bot-${Date.now()}`
    const token = await getToken(request)

    await page.addInitScript((authToken: string) => {
      localStorage.setItem('auth-token', authToken)
    }, token)
    await page.goto('/bots')
    await page.waitForTimeout(800)

    await aiAssert('页面包含“创建新Bot”卡片')
    await aiTap('点击“创建新Bot”卡片')
    await expect(page).toHaveURL(/\/bots\/create/)

    await aiInput(botName, '机器人名称输入框')
    await aiInput('由 midscene 自动创建的 bot', '机器人描述输入框')
    await aiTap('选择适配器类型 Napcat Ws Client')

    await aiInput('ws://localhost:8081', 'WebSocket 地址输入框')
    await aiInput('token', 'Token 输入框')
    await aiInput('3', '最大重连次数输入框')
    await aiInput('3000', '重连间隔（ms）输入框')
    await aiInput('30000', '心跳间隔（ms）输入框')

    await aiTap('提交按钮')
    await page.waitForTimeout(1500)

    await expect(page).toHaveURL(/\/bots/)
    await expect(page.getByRole('heading', { name: /^midscene-bot-/ }).first()).toBeVisible()
    await aiAssert('页面机器人列表包含新创建的 midscene-bot 机器人卡片')
    await aiAssert('新创建的机器人卡片展示适配器为 Napcat Ws Client')
  })
})
