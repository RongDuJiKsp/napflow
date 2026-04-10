import { type Page, expect } from '@playwright/test'
import { testAi as test } from './base/midscene'
import E2eEnvs from './config'
import { getToken } from './utils/token'

test.describe('账户设置功能', () => {
  test.beforeEach(async ({ page, request }) => {
    const token = await getToken(request)
    await page.addInitScript((authToken: string) => {
      localStorage.setItem('auth-token', authToken)
    }, token)
    await page.goto(`${E2eEnvs.E2E_BASE_URL}/settings/account`)
    await page.waitForURL('**/settings/account')
  })

  test('账户设置页面应展示基础模块', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: '设置', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: '账户设置', exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: '个人信息' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '密码设置' })).toBeVisible()
    await expect(page.getByRole('button', { name: '更新昵称' })).toBeVisible()
    await expect(page.getByRole('button', { name: '更新密码' })).toBeVisible()
  })

  test('更新昵称后应展示成功弹窗', async ({ page, aiString }) => {
    const currentNicknameRaw = await aiString(
      '读取页面顶部显示的当前登录用户名（例如 root），只返回用户名文本，不要返回其他内容',
    )
    const currentNickname = String(currentNicknameRaw)
      .replaceAll(/["']/g, '')
      .trim() || 'root'

    await page.getByPlaceholder('请输入新昵称').fill(currentNickname)
    await page.getByRole('button', { name: '更新昵称' }).click()

    const successToast = page.locator(
      '.ant-message-custom-content.ant-message-success',
    )
    await expect(successToast).toContainText('修改昵称成功')
  })

  test('更新密码时两次输入不一致应展示错误弹窗', async ({ page }) => {
    await page.getByPlaceholder('请输入当前密码').fill(E2eEnvs.E2E_LOGIN_ACC_PASSWORD)
    await page.getByPlaceholder('请输入新密码').fill('E2ePassword#123')
    await page.getByPlaceholder('请再次输入新密码').fill('AnotherPassword#456')
    await page.getByRole('button', { name: '更新密码' }).click()

    const errorNotice = page.locator(
      '.ant-notification-notice.ant-notification-notice-error',
    )
    await expect(errorNotice).toContainText('新密码和确认密码不一致')
  })

  test('更新密码后应展示成功弹窗', async ({ page }) => {
    await page.getByPlaceholder('请输入当前密码').fill(E2eEnvs.E2E_LOGIN_ACC_PASSWORD)
    await page.getByPlaceholder('请输入新密码').fill(E2eEnvs.E2E_LOGIN_ACC_PASSWORD)
    await page.getByPlaceholder('请再次输入新密码').fill(E2eEnvs.E2E_LOGIN_ACC_PASSWORD)
    await page.getByRole('button', { name: '更新密码' }).click()

    const successToast = page.locator(
      '.ant-message-custom-content.ant-message-success',
    )
    await expect(successToast).toContainText('修改密码成功')

    await expect(page.getByPlaceholder('请输入当前密码')).toHaveValue('')
    await expect(page.getByPlaceholder('请输入新密码')).toHaveValue('')
    await expect(page.getByPlaceholder('请再次输入新密码')).toHaveValue('')
  })
})

test.describe('工作区设置功能', () => {
  const password = 'E2ePassword#123'

  const buildTempAccount = () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 10000)}`
    return {
      email: `e2e-workspace-${seed}@napflow.com`,
      nickname: `e2e_workspace_${seed}`,
    }
  }

  const successToast = (page: Page) =>
    page.locator('.ant-message-custom-content.ant-message-success')

  const errorNotice = (page: Page) =>
    page.locator('.ant-notification-notice.ant-notification-notice-error')

  const getAccountCard = (page: Page, email: string) =>
    page
      .locator('div.rounded-lg')
      .filter({ has: page.getByText(email, { exact: true }) })
      .first()

  const openAccountMenu = async (page: Page, email: string) => {
    const accountCard = getAccountCard(page, email)
    await expect(accountCard).toBeVisible()
    await accountCard.locator('button').first().click()
  }

  const createAccount = async (
    page: Page,
    account: { email: string; nickname: string },
  ) => {
    await page.getByPlaceholder('请输入用户昵称').fill(account.nickname)
    await page.getByPlaceholder('请输入用户邮箱').fill(account.email)
    await page.getByPlaceholder('设置初始密码').fill(password)
    await page.getByPlaceholder('请再次确认密码').fill(password)
    await page.getByRole('button', { name: '添加账户' }).click()
    await expect(successToast(page).last()).toContainText('添加账号成功')
    await expect(getAccountCard(page, account.email)).toBeVisible()
  }

  const disableAccount = async (page: Page, email: string) => {
    await openAccountMenu(page, email)
    await page.getByRole('button', { name: '禁用账户' }).click()
    const disableDialog = page
      .getByRole('dialog')
      .filter({ hasText: '确认禁用账户' })
      .first()
    await expect(disableDialog).toBeVisible()
    await disableDialog.getByRole('button', { name: '确认禁用' }).click()
    await expect(successToast(page).last()).toContainText('禁用账号成功')
    await expect(getAccountCard(page, email)).toContainText('已禁用')
  }

  const cleanupTempAccount = async (page: Page, email: string) => {
    const accountCard = getAccountCard(page, email)
    if (await accountCard.count() === 0)
      return
    if ((await accountCard.getByText('已禁用').count()) > 0)
      return
    await disableAccount(page, email)
  }

  test.beforeEach(async ({ page, request }) => {
    const token = await getToken(request)
    await page.addInitScript((authToken: string) => {
      localStorage.setItem('auth-token', authToken)
    }, token)
    await page.goto(`${E2eEnvs.E2E_BASE_URL}/settings/workspace`)
    await page.waitForURL('**/settings/workspace')
  })

  test('正常创建并禁用账户', async ({ page }) => {
    const account = buildTempAccount()
    await expect(
      page.getByRole('heading', { name: '工作区设置', exact: true }),
    ).toBeVisible()

    await createAccount(page, account)
    await disableAccount(page, account.email)
  })

  test.describe('工作区账户操作（case 隔离）', () => {
    let tempAccount: { email: string; nickname: string } | null = null

    test.beforeEach(async ({ page }) => {
      tempAccount = buildTempAccount()
      await createAccount(page, tempAccount)
    })

    test.afterEach(async ({ page }) => {
      if (!tempAccount || page.isClosed()) {
        tempAccount = null
        return
      }
      await cleanupTempAccount(page, tempAccount.email)
      tempAccount = null
    })

    test('创建账户 badcase：两次密码不一致应报错', async ({ page }) => {
      const badcase = buildTempAccount()
      await page.getByPlaceholder('请输入用户昵称').fill(badcase.nickname)
      await page.getByPlaceholder('请输入用户邮箱').fill(badcase.email)
      await page.getByPlaceholder('设置初始密码').fill(password)
      await page.getByPlaceholder('请再次确认密码').fill('AnotherPassword#456')
      await page.getByRole('button', { name: '添加账户' }).click()
      await expect(errorNotice(page).last()).toContainText('新密码和确认密码不一致')
    })

    test('升级 badcase：未选择权限组时确认升级按钮不可用', async ({ page }) => {
      await openAccountMenu(page, tempAccount!.email)
      await page.getByRole('button', { name: '账户升级' }).click()

      const upgradeDialog = page
        .getByRole('dialog')
        .filter({ hasText: '账户升级' })
        .first()
      await expect(upgradeDialog).toBeVisible()
      await expect(
        upgradeDialog.getByRole('button', { name: '确认升级' }),
      ).toBeDisabled()
      await upgradeDialog.getByRole('button', { name: '取消' }).click()
    })

    test('升级账户应成功', async ({ page }) => {
      await openAccountMenu(page, tempAccount!.email)
      await page.getByRole('button', { name: '账户升级' }).click()

      const upgradeDialog = page
        .getByRole('dialog')
        .filter({ hasText: '账户升级' })
        .first()
      await expect(upgradeDialog).toBeVisible()
      await upgradeDialog.locator('.ant-select').click()
      await page.getByRole('option', { name: '管理员' }).click()
      await upgradeDialog.getByRole('button', { name: '确认升级' }).click()

      await expect(successToast(page).last()).toContainText('升级账号成功')
      await expect(getAccountCard(page, tempAccount!.email)).toContainText('管理员')
    })

    test('降级 badcase：未选择权限组时确认降级按钮不可用', async ({ page }) => {
      await openAccountMenu(page, tempAccount!.email)
      await page.getByRole('button', { name: '账户降级' }).click()

      const downgradeDialog = page
        .getByRole('dialog')
        .filter({ hasText: '账户降级' })
        .first()
      await expect(downgradeDialog).toBeVisible()
      await expect(
        downgradeDialog.getByRole('button', { name: '确认降级' }),
      ).toBeDisabled()
      await downgradeDialog.getByRole('button', { name: '取消' }).click()
    })

    test('降级账户应成功', async ({ page }) => {
      await openAccountMenu(page, tempAccount!.email)
      await page.getByRole('button', { name: '账户升级' }).click()

      const upgradeDialog = page
        .getByRole('dialog')
        .filter({ hasText: '账户升级' })
        .first()
      await upgradeDialog.locator('.ant-select').click()
      await page.getByRole('option', { name: '管理员' }).click()
      await upgradeDialog.getByRole('button', { name: '确认升级' }).click()
      await expect(successToast(page).last()).toContainText('升级账号成功')

      await openAccountMenu(page, tempAccount!.email)
      await page.getByRole('button', { name: '账户降级' }).click()
      const downgradeDialog = page
        .getByRole('dialog')
        .filter({ hasText: '账户降级' })
        .first()
      await downgradeDialog.locator('.ant-select').click()
      await page.getByRole('option', { name: '管理员' }).click()
      await downgradeDialog.getByRole('button', { name: '确认降级' }).click()

      await expect(successToast(page).last()).toContainText('降级账号成功')
      await expect(
        getAccountCard(page, tempAccount!.email).getByText('管理员'),
      ).toHaveCount(0)
    })

    test('禁用 badcase：取消禁用后账户应保持未禁用状态', async ({ page }) => {
      await openAccountMenu(page, tempAccount!.email)
      await page.getByRole('button', { name: '禁用账户' }).click()

      const disableDialog = page
        .getByRole('dialog')
        .filter({ hasText: '确认禁用账户' })
        .first()
      await expect(disableDialog).toBeVisible()
      await disableDialog.getByRole('button', { name: '取消' }).click()
      await expect(disableDialog).toBeHidden()
      await expect(getAccountCard(page, tempAccount!.email)).not.toContainText('已禁用')
    })
  })
})
