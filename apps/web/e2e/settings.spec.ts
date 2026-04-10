import { expect } from '@playwright/test'
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
