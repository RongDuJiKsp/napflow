import { useAreaChange } from '@/app/components/_base/input/hooks/use-area-change'
import { useAccountMeta } from '@/app/hooks/account/use-account-meta'
import { jsonQ } from '@/utils/net'
import type { NullRespType } from '@shared/data-transfer/_base'
import { Code } from '@shared/data-transfer/_base'
import type { AccountCreateReqType, AccountDisableReqType, AccountUpDownGradeReqType } from '@shared/data-transfer/account/account'
import { AccountCreateReq, AccountDisableReq, AccountUpDownGradeReq } from '@shared/data-transfer/account/account'
import { App } from 'antd'
import { useCallback, useState } from 'react'
import z from 'zod'

export const useAccountActions = () => {
  const { isAdmin: enableFeature } = useAccountMeta()
  const { message, notification } = App.useApp()
  const [formValue, setFormValue] = useState<AccountUpDownGradeReqType & AccountDisableReqType>({
    email: '',
    groupType: [],
  })
  const handleChangeEmail = useAreaChange(setFormValue, 'email')
  const handleChangeGroupType = useAreaChange(setFormValue, 'groupType')

  const handleUpgrade = useCallback(async () => {
    const validated = AccountUpDownGradeReq.safeParse(formValue)
    if(!validated.success) {
      notification.error({
        title: '账号升级提交失败',
        description: z.prettifyError(validated.error),
      })
      return
    }
    const res = await jsonQ.Post<NullRespType>('/account/upgrade', validated.data)
    if(res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('升级账号成功')
  }, [formValue, notification, message])
  const handleDownGrade = useCallback(async () => {
    const validated = AccountUpDownGradeReq.safeParse(formValue)
    if(!validated.success) {
      notification.error({
        title: '账号降级提交失败',
        description: z.prettifyError(validated.error),
      })
      return
    }
    const res = await jsonQ.Post<NullRespType>('/account/downgrade', validated.data)
    if(res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('降级账号成功')
  }, [formValue, notification, message])

  const handleDisable = useCallback(async () => {
    const validated = AccountDisableReq.safeParse(formValue)
    if(!validated.success) {
      notification.error({
        title: '账号禁用提交失败',
        description: z.prettifyError(validated.error),
      })
      return
    }
    const res = await jsonQ.Post<NullRespType>('/account/disable', validated.data)
    if(res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('禁用账号成功')
  }, [formValue, notification, message])

  return {
    enableFeature,
    formValue,
    handleChangeEmail,
    handleChangeGroupType,
    handleUpgrade,
    handleDownGrade,
    handleDisable,
  }
}

export const useAccountAddOperators = () => {
  const { isAdmin: enableFeature } = useAccountMeta()
  const { message, notification } = App.useApp()
  const [formValue, setFormValue] = useState<AccountCreateReqType>({
    email: '',
    password: '',
    nickname: '',
  })
  const handleChangeEmail = useAreaChange(setFormValue, 'email')
  const handleChangePassword = useAreaChange(setFormValue, 'password')
  const handleChangeNickname = useAreaChange(setFormValue, 'nickname')
  const handleSubmit = useCallback(async () => {
    const validated = AccountCreateReq.safeParse(formValue)
    if(!validated.success) {
      notification.error({
        title: '账号添加请求提交失败',
        description: z.prettifyError(validated.error),
      })
      return
    }
    const res = await jsonQ.Post<NullRespType>('/account/create', validated.data)
    if(res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('添加账号成功')
  }, [formValue, notification, message])

  return {
    enableFeature,
    formValue,
    handleChangeEmail,
    handleChangePassword,
    handleChangeNickname,
    handleSubmit,
  }
}
