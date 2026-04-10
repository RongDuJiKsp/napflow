import { expect } from '@playwright/test'
import { testAi as test } from './base/midscene'
import E2eEnvs from './config'
import { getToken } from './utils/token'

test.describe('健康面板功能', () => {
  test.beforeEach(async ({ page, request }) => {
    const token = await getToken(request)
    await page.addInitScript((authToken: string) => {
      localStorage.setItem('auth-token', authToken)
    }, token)
    await page.goto(`${E2eEnvs.E2E_BASE_URL}/health-check`)
    await page.waitForURL('**/health-check')
  })

  test('健康面板应处于等待采集或图表展示状态', async ({
    page,
    aiAssert,
    aiBoolean,
    aiWaitFor,
  }) => {
    const aiAwait = aiWaitFor

    await aiAwait('等待“加载健康数据中...”加载界面消失')
    await expect(page.getByText('加载健康数据中...')).toHaveCount(0)

    await aiAssert(
      '当前页面语义为以下两种之一：1. 等待系统采集数据（可见“暂无健康监控数据”“请等待系统采集数据”）；2. 图表展示界面（可见“系统健康监控”及健康度或趋势图表）。',
    )

    const isDashboardView = Boolean(
      await aiBoolean(
        '当前页面是否为图表展示界面？判断标准：可见“最后更新”以及多个图表卡片标题（例如“内存健康度”“CPU 使用趋势”“事件循环延迟趋势”）。仅返回 true 或 false。',
      ),
    )

    if (isDashboardView) {
      await aiAssert(
        '界面应与健康监控图表展示页一致：顶部包含“系统健康监控”和“最后更新”，下方展示健康度卡片与趋势图卡片。',
      )
      await expect(
        page.getByRole('heading', { name: '系统健康监控', exact: true }),
      ).toBeVisible()
      await expect(page.getByText('内存健康度')).toBeVisible()
      await expect(page.getByText('事件循环健康度')).toBeVisible()
      await expect(page.getByText('GC 健康度')).toBeVisible()
      await expect(page.getByText('CPU 使用趋势')).toBeVisible()
      await expect(page.getByText('事件循环延迟趋势')).toBeVisible()
    }
  })
})
