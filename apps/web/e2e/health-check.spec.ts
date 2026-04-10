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
      await aiAssert(
        '展示面板结构应清晰：先看到顶部标题与评分卡（内存健康度、事件循环健康度、GC 健康度），然后再向下查看趋势图区域。',
      )
      await expect(
        page.getByRole('heading', { name: '系统健康监控', exact: true }),
      ).toBeVisible()
      await expect(page.getByText('内存健康度')).toBeVisible()
      await expect(page.getByText('事件循环健康度')).toBeVisible()
      await expect(page.getByText('GC 健康度')).toBeVisible()

      const hasValidLastUpdateTime = Boolean(
        await aiBoolean(
          '“最后更新”后面的内容是否为合法时间文本（例如 HH:mm 或 HH:mm:ss），且看起来不是占位符或空值？仅返回 true 或 false。',
        ),
      )
      expect(hasValidLastUpdateTime).toBe(true)

      // 由于分辨率限制，趋势图相关断言前先滚动到底部区域。
      await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' })
      })

      // FIXME: 滚动有问题
    //   await aiAssert(
    //     '当前已滚动到趋势图区域，可见底部趋势图卡片（例如“GC 次数趋势”“GC 时延趋势”）。',
    //   )

      const trendChartTitles = [
        'CPU 使用趋势',
        '事件循环延迟趋势',
        '内存使用趋势',
        'GC 次数趋势',
        'GC 时延趋势',
      ] as const
      for (const title of trendChartTitles) {
        const heading = page.getByRole('heading', { name: title, exact: true })
        await heading.scrollIntoViewIfNeeded()
        await expect(heading).toBeVisible()
      }

      const hasConsistentXAxis = Boolean(
        await aiBoolean(
          '请判断当前页面这些趋势图（CPU 使用趋势、事件循环延迟趋势、内存使用趋势、GC 次数趋势、GC 时延趋势）的横轴是否都表示同一时间线，并使用一致的时间刻度格式（例如 HH:mm）。仅返回 true 或 false。',
        ),
      )
      expect(hasConsistentXAxis).toBe(true)

      const xAxisIsChronological = Boolean(
        await aiBoolean(
          '请判断上述趋势图中每个图表的横轴时间标签是否整体从左到右按时间递进（允许个别标签省略），不存在明显逆序。仅返回 true 或 false。',
        ),
      )
      expect(xAxisIsChronological).toBe(true)

      const unitsMatchChartSemantics = Boolean(
        await aiBoolean(
          '请判断各趋势图纵轴单位或数值语义是否与标题一致：CPU 使用趋势应为百分比或比例语义，事件循环延迟/GC 时延应为时间单位（如 ms），内存使用趋势应为容量单位（如 MB/GB），GC 次数趋势应为次数语义。仅返回 true 或 false。',
        ),
      )
      expect(unitsMatchChartSemantics).toBe(true)

      const scoreCardsAreReasonable = Boolean(
        await aiBoolean(
          '请判断顶部三个健康度卡片（内存健康度、事件循环健康度、GC 健康度）中的分数展示是否都在 0-100 的合理范围内，且没有明显占位符（如 -- 或 NaN）。仅返回 true 或 false。',
        ),
      )
      expect(scoreCardsAreReasonable).toBe(true)

      await aiAssert(
        '趋势图区域的布局应满足“标题-图表-坐标轴”结构完整：每张图都能看到标题与可读坐标轴，不应出现仅有标题但图表主体缺失的卡片。',
      )

      const gcStatsCardTitle = page.getByRole('heading', {
        name: 'GC 统计信息',
        exact: true,
      })

      if (await gcStatsCardTitle.isVisible().catch(() => false)) {
        await aiAssert(
          '“GC 统计信息”卡片中应包含“GC 频率”“平均耗时”“健康分数”三项指标，并带有对应单位信息（次/分钟、ms、分）。',
        )
      }
    }
  })
})
