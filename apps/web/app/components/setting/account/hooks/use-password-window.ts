import { useAreaChange } from '@/app/components/_base/input/hooks/use-area-change'
import { notification } from 'antd'
import { useCallback, useState } from 'react'
import z from 'zod'

const ChangePasswordForm = z.object({
  oldPassword: z.string().min(1, '请输入旧密码'),
  newPassword: z.string().min(1, '请输入新密码'),
  confirmPassword: z.string().min(1, '请输入确认密码'),
})

type ChangePasswordFormType = z.infer<typeof ChangePasswordForm>
export const usePasswordWindow = () => {
  const [notificationApi] = notification.useNotification()
  const [formValue, setFormValue] = useState<ChangePasswordFormType>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChangeOldPassword = useAreaChange(setFormValue, 'oldPassword')
  const handleChangeNewPassword = useAreaChange(setFormValue, 'newPassword')
  const handleChangeConfirmPassword = useAreaChange(setFormValue, 'confirmPassword')
  const handleSubmit = useCallback(() => {
    const validated = ChangePasswordForm.safeParse(formValue)
    if(!validated.success) {
      notificationApi.error({
        title: '修改密码失败',
        description: z.prettifyError(validated.error),
      })
    }
  }, [formValue, notificationApi])

  return {
    formValue,
    handleChangeOldPassword,
    handleChangeNewPassword,
    handleChangeConfirmPassword,
    handleSubmit,
  }
}
