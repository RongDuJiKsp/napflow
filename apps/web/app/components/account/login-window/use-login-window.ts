import type { LoginReq } from '@shared/data-transfer/account/account'
import { ZodCheckLoginReq } from '@shared/data-transfer/account/account'
import { useCallback, useState } from 'react'
import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { App } from 'antd'
import z from 'zod'
import { useLogin } from './use-login'

export const useLoginWindow = () => {
  const { notification } = App.useApp()

  const { login } = useLogin()
  const [input, setInput] = useState<LoginReq>({ email: '', password: '' })
  const handleEmailChange = useAreaChangeHandler(setInput, 'email')
  const handlePasswordChange = useAreaChangeHandler(setInput, 'password')

  const handleSubmit = useCallback(async () => {
    const form = ZodCheckLoginReq.safeParse(input)
    if (!form.success) {
      notification.error({
        title: 'Validation Error',
        description: z.prettifyError(form.error),
      })
      return
    }
    await login(input)
  }, [input, login, notification])

  return {
    input,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  }
}
