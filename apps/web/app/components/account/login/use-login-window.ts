import type { LoginReqType } from '@shared/data-transfer/account/account'
import { LoginReq } from '@shared/data-transfer/account/account'
import { useCallback, useState } from 'react'
import { useAreaChange } from '@components/_base/input/hooks/use-area-change'
import { message } from 'antd'
import z from 'zod'
import { useLogin } from './use-login'

export const useLoginWindow = () => {
  const { login } = useLogin()
  const [input, setInput] = useState<LoginReqType>({ email: '', password: '' })
  const handleEmailChange = useAreaChange(setInput, 'email')
  const handlePasswordChange = useAreaChange(setInput, 'password')

  const handleSubmit = useCallback(async () => {
    const form = LoginReq.safeParse(input)
    if(!form.success) {
      message.error(z.prettifyError(form.error))
      return
    }
    await login(input)
  }, [input, login])

  return {
    input,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  }
}
