import { useAreaChange } from '@/app/hooks/utils/use-area-change'
import { jsonQ } from '@/utils/net'
import type { NullRespType } from '@shared/data-transfer/_base'
import { Code } from '@shared/data-transfer/_base'
import { AccountChangeNicknameReq, type AccountChangeNicknameReqType } from '@shared/data-transfer/account/account'
import { App } from 'antd'
import { useCallback, useState } from 'react'
import z from 'zod'

export const useUpdateNickname = () => {
  const { message, notification } = App.useApp()
  const [formValue, setFormValue] = useState<AccountChangeNicknameReqType>({
    nickname: '',
  })
  const handleChangeNickname = useAreaChange(setFormValue, 'nickname')

  const handleSubmit = useCallback(async () => {
    const validated = AccountChangeNicknameReq.safeParse(formValue)
    if(!validated.success) {
      notification.error({
        title: '提交失败',
        description: z.prettifyError(validated.error),
      })
      return
    }
    const res = await jsonQ.Post<NullRespType>('/account/change-nickname', validated.data)
    if(res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('修改昵称成功')
  }, [formValue, notification, message])

  return {
    formValue,
    handleChangeNickname,
    handleSubmit,
  }
}
