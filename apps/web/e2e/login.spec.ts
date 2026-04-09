import { testAi as test } from './base/midscene'
import E2eEnvs from './config'
test.describe('登录页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2eEnvs.E2E_BASE_URL}/login`)
  })

  test('login 页面正常登录流程', async ({ page, aiAssert }) => {
    await page
      .getByRole('textbox', { name: '邮箱' })
      .fill(E2eEnvs.E2E_LOGIN_ACC_EMAIL)
    await page
      .getByRole('textbox', { name: '密码' })
      .fill(E2eEnvs.E2E_LOGIN_ACC_PASSWORD)
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForURL('**/bots')
    const assertionHaveTarget = [
      '页面包含“点击开始配置您的聊天机器人”文案',
      '主内容区域包含“创建新Bot点击开始配置您的聊天机器人”文案',
      '页面标题包含“NapFlow”',
      '导航栏包含“机器人”菜单项',
      '导航栏包含“工作流”菜单项',
      '导航栏包含“健康面板”菜单项',
      '页面显示当前登录用户为 root',
    ]
    await aiAssert(assertionHaveTarget.join('，'))
  })

  test('直接点击登录按钮被拦截', async ({ page, aiAssert }) => {
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForSelector(
      '.ant-notification-notice.ant-notification-notice-error',
    )
    await aiAssert('页面出现 Validation Error 弹窗，并显示邮箱必填错误信息')
  })

  test('输入的邮箱不合法', async ({ page, aiAssert }) => {
    await page.getByRole('textbox', { name: '邮箱' }).fill('napflow.com')
    await page
      .getByRole('textbox', { name: '密码' })
      .fill(E2eEnvs.E2E_LOGIN_ACC_PASSWORD)
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForSelector(
      '.ant-notification-notice.ant-notification-notice-error',
    )
    await aiAssert('页面出现 Validation Error 弹窗，并显示邮箱不合法错误信息')
  })

  test('未输入密码被拦截', async ({ page, aiAssert }) => {
    await page
      .getByRole('textbox', { name: '邮箱' })
      .fill(E2eEnvs.E2E_LOGIN_ACC_EMAIL)
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForSelector(
      '.ant-notification-notice.ant-notification-notice-error',
    )
    await aiAssert('页面出现 Validation Error 弹窗，并显示密码必填错误信息')
  })

  test('未输入邮箱，但输入了密码被拦截', async ({ page, aiAssert }) => {
    await page
      .getByRole('textbox', { name: '密码' })
      .fill(E2eEnvs.E2E_LOGIN_ACC_PASSWORD)
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForSelector(
      '.ant-notification-notice.ant-notification-notice-error',
    )
    await aiAssert('页面出现 Validation Error 弹窗，并显示邮箱必填错误信息')
  })

  test('前端校验全部通过 但是用户不存在', async ({ page, aiAssert }) => {
    await page
      .getByRole('textbox', { name: '邮箱' })
      .fill('neversghouldbeexpendde@napflow.com')
    await page
      .getByRole('textbox', { name: '密码' })
      .fill('averylongandwrongpassword')
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForSelector('.ant-message-custom-content.ant-message-error')
    await aiAssert('页面出现弹窗，并显示用户不存在或密码错误信息')
  })
})
