import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import { App } from 'antd'
import { useCallback } from 'react'
import z from 'zod'
import { useResetState } from 'ahooks'
import { useSubmitZod } from '@/app/hooks/utils/use-form'

const ChangePasswordForm = z.object({
  oldPassword: z.string().min(1, '请输入旧密码'),
  newPassword: z.string().min(1, '请输入新密码'),
  confirmPassword: z.string().min(1, '请输入确认密码'),
})
type ChangePasswordFormType = z.infer<typeof ChangePasswordForm>

const submitForm = async (data: ChangePasswordFormType) =>
  await jsonQ.Post<NullResp>('/account/change-password', data)
export const useUpdatePassword = () => {
  const { notification } = App.useApp()

  const [formValue, setFormValue, resetForm]
    = useResetState<ChangePasswordFormType>({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

  const handleChangeOldPassword = useAreaChangeHandler(
    setFormValue,
    'oldPassword',
  )
  const handleChangeNewPassword = useAreaChangeHandler(
    setFormValue,
    'newPassword',
  )
  const handleChangeConfirmPassword = useAreaChangeHandler(
    setFormValue,
    'confirmPassword',
  )
  const submitReq = useSubmitZod(formValue, ChangePasswordForm, submitForm, {
    successText: '修改密码成功',
    errorText: '提交失败',
  })
  const handleSubmit = useCallback(async () => {
    if (formValue.newPassword !== formValue.confirmPassword) {
      notification.error({
        title: '提交失败',
        description: '新密码和确认密码不一致',
      })
      return
    }
    await submitReq()
    resetForm()
  }, [formValue, submitReq, resetForm, notification])

  return {
    formValue,
    handleChangeOldPassword,
    handleChangeNewPassword,
    handleChangeConfirmPassword,
    handleSubmit,
  }
}
