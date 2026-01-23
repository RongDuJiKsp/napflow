import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { useAccountMeta } from '@/app/hooks/account/use-account-meta'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import { Code } from '@shared/data-transfer/_base'
import {
  ZodCheckAccountCreateReq,
  ZodCheckAccountDisableReq,
  ZodCheckAccountUpDownGradeReq,
} from '@shared/data-transfer/account/account'
import { App } from 'antd'
import { useCallback } from 'react'
import z from 'zod'
import { useAccountsQuery } from '@/app/hooks/query/use-accounts-query'
import { useResetState } from 'ahooks'
import type { AccountUpDownGradeReq } from '@shared/data-transfer/account/account'

export const useAccountActions = () => {
  const { isAdmin: enableFeature } = useAccountMeta()
  const { message, notification } = App.useApp()
  const { refetch: refreshAccList } = useAccountsQuery()

  const handleUpgrade = useCallback(
    async (email: string, groupType: AccountUpDownGradeReq['groupType']) => {
      const validated = ZodCheckAccountUpDownGradeReq.safeParse({
        email,
        groupType,
      })
      if (!validated.success) {
        notification.error({
          title: '账号升级提交失败',
          description: z.prettifyError(validated.error),
        })
        return
      }
      const res = await jsonQ.Post<NullResp>(
        '/account/upgrade',
        validated.data,
      )
      if (res.statusCode !== Code.Ok) {
        message.error(res.message)
        return
      }
      await refreshAccList()
      message.success('升级账号成功')
    },
    [notification, message, refreshAccList],
  )
  const handleDownGrade = useCallback(
    async (email: string, groupType: AccountUpDownGradeReq['groupType']) => {
      const validated = ZodCheckAccountUpDownGradeReq.safeParse({
        email,
        groupType,
      })
      if (!validated.success) {
        notification.error({
          title: '账号降级提交失败',
          description: z.prettifyError(validated.error),
        })
        return
      }
      const res = await jsonQ.Post<NullResp>(
        '/account/downgrade',
        validated.data,
      )
      if (res.statusCode !== Code.Ok) {
        message.error(res.message)
        return
      }
      await refreshAccList()
      message.success('降级账号成功')
    },
    [refreshAccList, message, notification],
  )

  const handleDisable = useCallback(
    async (email: string) => {
      const validated = ZodCheckAccountDisableReq.safeParse({ email })
      if (!validated.success) {
        notification.error({
          title: '账号禁用提交失败',
          description: z.prettifyError(validated.error),
        })
        return
      }
      const res = await jsonQ.Post<NullResp>(
        '/account/disable',
        validated.data,
      )
      if (res.statusCode !== Code.Ok) {
        message.error(res.message)
        return
      }
      await refreshAccList()
      message.success('禁用账号成功')
    },
    [refreshAccList, message, notification],
  )

  return {
    enableFeature,
    handleUpgrade,
    handleDownGrade,
    handleDisable,
  }
}

export const useAccountAddOperators = () => {
  const { isAdmin: enableFeature } = useAccountMeta()
  const { refetch: refreshAccList } = useAccountsQuery()
  const { message, notification } = App.useApp()
  const [formValue, setFormValue, resetForm] = useResetState({
    email: '',
    password: '',
    nickname: '',
    passwordAgain: '',
  })
  const handleChangeEmail = useAreaChangeHandler(setFormValue, 'email')
  const handleChangePassword = useAreaChangeHandler(setFormValue, 'password')
  const handleChangeNickname = useAreaChangeHandler(setFormValue, 'nickname')
  const handleChangePasswordAgain = useAreaChangeHandler(
    setFormValue,
    'passwordAgain',
  )

  const handleSubmit = useCallback(async () => {
    if (formValue.password !== formValue.passwordAgain) {
      notification.error({
        title: '提交失败',
        description: '新密码和确认密码不一致',
      })
      return
    }

    const validated = ZodCheckAccountCreateReq.safeParse(formValue)
    if (!validated.success) {
      notification.error({
        title: '账号添加请求提交失败',
        description: z.prettifyError(validated.error),
      })
      return
    }
    const res = await jsonQ.Post<NullResp>('/account/create', validated.data)
    if (res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('添加账号成功')
    resetForm()
    await refreshAccList()
  }, [formValue, notification, message, refreshAccList, resetForm])

  return {
    enableFeature,
    formValue,
    handleChangeEmail,
    handleChangePassword,
    handleChangeNickname,
    handleChangePasswordAgain,
    handleSubmit,
  }
}
