import { useAreaChange } from '@/app/hooks/utils/use-area-change'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import { Code } from '@shared/data-transfer/_base'
import { type AccountChangeNicknameReq, ZodCheckAccountChangeNicknameReq } from '@shared/data-transfer/account/account'
import { App } from 'antd'
import { useCallback } from 'react'
import z from 'zod'
import { useResetState } from 'ahooks'

export const useUpdateNickname = () => {
  const { message, notification } = App.useApp()
  const [formValue, setFormValue, resetForm] = useResetState<AccountChangeNicknameReq>({
    nickname: '',
  })
  const handleChangeNickname = useAreaChange(setFormValue, 'nickname')

  const handleSubmit = useCallback(async () => {
    const validated = ZodCheckAccountChangeNicknameReq.safeParse(formValue)
    if(!validated.success) {
      notification.error({
        title: '提交失败',
        description: z.prettifyError(validated.error),
      })
      return
    }
    const res = await jsonQ.Post<NullResp>('/account/change-nickname', validated.data)
    if(res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    resetForm()
    message.success('修改昵称成功')
  }, [formValue, resetForm, message, notification])

  return {
    formValue,
    handleChangeNickname,
    handleSubmit,
  }
}
