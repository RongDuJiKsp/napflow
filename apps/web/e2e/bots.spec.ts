import { expect } from '@playwright/test'
import { testAi as test } from './base/midscene'
import { getToken } from './utils/token'
import E2eEnvs from './config'

test.describe('机器人列表功能', () => {
  test.beforeEach(async ({ page, request }) => {
    const token = await getToken(request)
    await page.addInitScript((authToken: string) => {
      localStorage.setItem('auth-token', authToken)
    }, token)
    await page.goto(`${E2eEnvs.E2E_BASE_URL}/bots`)
    await page.waitForURL('**/bots')
  })
  test('成功创建使用NapcatWs的适配器', async ({ page, aiInput, aiTap, aiAssert }) => {
    const botName = `mids-bot-${Date.now() / 60 / 1e3}`
    const creationTime = new Date().toLocaleString()

    await aiAssert('页面包含“创建新Bot”卡片')
    await aiTap('点击“创建新Bot”卡片')
    await expect(page).toHaveURL(/\/bots\/create/)

    await aiInput(botName, '机器人名称输入框')
    await aiInput(`由 midscene 自动创建的 bot，创建时间为${creationTime}`, '机器人描述输入框')
    await aiTap('选择适配器类型 Napcat Ws Client')

    await aiInput(E2eEnvs.E2E_NAPFLOW_WS_ENDPOINT, 'WebSocket 地址输入框')
    await aiInput(E2eEnvs.E2E_NAPFLOW_WS_TOKEN, 'Token 输入框')
    await aiInput(E2eEnvs.E2E_NAPFLOW_WS_MAX_RETRIES.toString(), '最大重连次数输入框')
    await aiInput(E2eEnvs.E2E_NAPFLOW_WS_RECONNECT_INTERVAL.toString(), '重连间隔（ms）输入框')
    await aiInput(E2eEnvs.E2E_NAPFLOW_WS_HEARTBEAT_INTERVAL.toString(), '心跳间隔（ms）输入框')

    await page.getByRole('button', { name: '提交' }).click()
    await page.waitForTimeout(1500)
    await expect(page).toHaveURL(/\/bots/)
    await expect(page.getByRole('heading', { name: /^mids-bot-/ }).first()).toBeVisible()
    await aiAssert(`页面机器人列表包含新创建的机器人卡片，描述中包含的创建时间为${creationTime}，新创建的机器人卡片展示适配器为 Napcat Ws Client`)
  })

  test('Napcat Ws 配置 badcase: WebSocket 地址非法', async ({ page, aiInput, aiTap, aiAssert }) => {
    await aiTap('点击“创建新Bot”卡片')
    await expect(page).toHaveURL(/\/bots\/create/)

    await aiInput(`badcase-bot-${Date.now()}`, '机器人名称输入框')
    await aiInput('badcase: 非法 ws 地址', '机器人描述输入框')
    await aiInput('not-a-url', 'WebSocket 地址输入框')
    await aiInput(E2eEnvs.E2E_NAPFLOW_WS_TOKEN, 'Token 输入框')
    await aiInput('3', '最大重连次数输入框')
    await aiInput('3000', '重连间隔（ms）输入框')
    await aiInput('30000', '心跳间隔（ms）输入框')

    await page.getByRole('button', { name: '提交' }).click()
    await expect(page).toHaveURL(/\/bots\/create/)
    await aiAssert('页面出现“配置检查失败”错误提示，且仍停留在创建机器人页面')
  })

  test('Napcat Ws 配置 badcase: 重连间隔小于 1000ms', async ({ page, aiInput, aiTap, aiAssert }) => {
    await aiTap('点击“创建新Bot”卡片')
    await expect(page).toHaveURL(/\/bots\/create/)

    await aiInput(`badcase-bot-${Date.now()}`, '机器人名称输入框')
    await aiInput('badcase: 重连间隔过小', '机器人描述输入框')
    await aiInput(E2eEnvs.E2E_NAPFLOW_WS_ENDPOINT, 'WebSocket 地址输入框')
    await aiInput(E2eEnvs.E2E_NAPFLOW_WS_TOKEN, 'Token 输入框')
    await aiInput('3', '最大重连次数输入框')
    await aiInput('999', '重连间隔（ms）输入框')
    await aiInput('30000', '心跳间隔（ms）输入框')

    await page.getByRole('button', { name: '提交' }).click()
    await expect(page).toHaveURL(/\/bots\/create/)
    await expect(page.getByText('配置检查失败')).toBeVisible() 
    await aiAssert('页面出现“配置检查失败”错误提示，且仍停留在创建机器人页面')
  })

  test('Napcat Ws 配置 badcase: WebSocket 地址为空', async ({ page, aiInput, aiTap, aiAssert }) => {
    await aiTap('点击“创建新Bot”卡片')
    await expect(page).toHaveURL(/\/bots\/create/)

    await aiInput(`badcase-bot-${Date.now()}`, '机器人名称输入框')
    await aiInput('badcase: ws 地址为空', '机器人描述输入框')
    await aiInput('', 'WebSocket 地址输入框')
    await aiInput(E2eEnvs.E2E_NAPFLOW_WS_TOKEN, 'Token 输入框')
    await aiInput('3', '最大重连次数输入框')
    await aiInput('3000', '重连间隔（ms）输入框')
    await aiInput('30000', '心跳间隔（ms）输入框')

    await page.getByRole('button', { name: '提交' }).click()
    await expect(page).toHaveURL(/\/bots\/create/)
    await expect(page.getByText('配置检查失败')).toBeVisible() 
    await aiAssert('页面出现“配置检查失败”错误提示，且仍停留在创建机器人页面')
  })
})
