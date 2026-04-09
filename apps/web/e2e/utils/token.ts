import type { APIRequestContext } from '@playwright/test'
import E2eEnvs from '../config'

type LoginResp = {
  statusCode: number
  message?: string
  data?: {
    token?: string
  }
}

type GetTokenOptions = {
  email?: string
  password?: string
  url?: string
}

/**
 * 调用登录接口并返回 JWT token。
 */
export const getToken = async (
  request: APIRequestContext,
  options: GetTokenOptions = {},
): Promise<string> => {
  const { email = E2eEnvs.E2E_LOGIN_ACC_EMAIL, password = E2eEnvs.E2E_LOGIN_ACC_PASSWORD, url = `${E2eEnvs.E2E_BASE_URL}/api/account/login` } = options
  const response = await request.post(url, {
    data: {
      email, password,
    },
  })

  if (!response.ok()) {
    throw new Error(
      `登录接口请求失败: ${response.status()} ${response.statusText()}`,
    )
  }

  const resp = (await response.json()) as LoginResp
  const token = resp.data?.token

  if (resp.statusCode !== 200 || !token) {
    throw new Error(
      `登录接口返回异常: ${JSON.stringify({
        statusCode: resp.statusCode,
        message: resp.message,
        hasToken: Boolean(token),
      })}`,
    )
  }

  return token
}
