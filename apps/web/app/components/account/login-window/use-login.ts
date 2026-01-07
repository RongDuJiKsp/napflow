import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import type {
  LoginReq,
  LoginResp,
} from '@shared/data-transfer/account/account'
import { App } from 'antd'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export const useLogin = () => {
  const { message } = App.useApp()
  const router = useRouter()
  const login = useCallback(
    async (data: LoginReq) => {
      const resp = await jsonQ.Post<LoginResp>('/account/login', data)
      if (resp.statusCode !== Code.Ok || !resp.data) {
        message.error(resp.message)
        return
      }
      localStorage.setItem('auth-token', resp.data?.token)
      message.success('登录成功')
      router.replace('/')
    },
    [router, message],
  )
  return {
    login,
  }
}
