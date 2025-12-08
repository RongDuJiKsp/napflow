import { useAreaChange } from '@/app/components/_base/input/hooks/use-area-change'
import { jsonQ } from '@/utils/net'
import { Code, type NullRespType } from '@shared/data-transfer/_base'
import { App } from 'antd'
import { useCallback, useState } from 'react'
import z from 'zod'

const ChangePasswordForm = z.object({
  oldPassword: z.string().min(1, '请输入旧密码'),
  newPassword: z.string().min(1, '请输入新密码'),
  confirmPassword: z.string().min(1, '请输入确认密码'),
})

type ChangePasswordFormType = z.infer<typeof ChangePasswordForm>
export const useUpdatePassword = () => {
  const { message, notification } = App.useApp()

  const [formValue, setFormValue] = useState<ChangePasswordFormType>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errMsg, setErrMsg] = useState<string>('')

  const handleChangeOldPassword = useAreaChange(setFormValue, 'oldPassword')
  const handleChangeNewPassword = useAreaChange(setFormValue, 'newPassword')
  const handleChangeConfirmPassword = useAreaChange(setFormValue, 'confirmPassword')
  const handleSubmit = useCallback(async () => {
    if(formValue.newPassword !== formValue.confirmPassword) {
      setErrMsg('新密码和确认密码不一致')
      return
    }
    setErrMsg('')

    const validated = ChangePasswordForm.safeParse(formValue)
    if(!validated.success) {
      notification.error({
        title: '提交失败',
        description: z.prettifyError(validated.error),
      })
      return
    }
    const res = await jsonQ.Post<NullRespType>('/account/change-password', validated.data)
    if(res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('修改密码成功')
  }, [formValue, notification, message])

  return {
    formValue,
    errMsg,
    handleChangeOldPassword,
    handleChangeNewPassword,
    handleChangeConfirmPassword,
    handleSubmit,
  }
}
