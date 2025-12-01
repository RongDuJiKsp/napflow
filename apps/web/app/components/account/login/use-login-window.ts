import type { LoginReqType } from '@shared/data-transfer/account/account'
import { LoginReq } from '@shared/data-transfer/account/account'
import { useCallback, useState } from 'react'
import { useAreaChange } from '@components/_base/input/hooks/use-area-change'
import { message } from 'antd'

export const useLoginWindow = () => {
  const [input, setInput] = useState<LoginReqType>({ email: '', password: '' })
  const handleEmailChange = useAreaChange(setInput, 'email')
  const handlePasswordChange = useAreaChange(setInput, 'password')

  const handleSubmit = useCallback(() => {
    const res = LoginReq.safeParse(input)
    if(!res.success)
      message.error(res.error.message)
  }, [input])

  return {
    input,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  }
}
