import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import {
  type AccountChangeNicknameReq,
  ZodCheckAccountChangeNicknameReq,
} from '@shared/data-transfer/account/account'
import { useResetState } from 'ahooks'
import { useSubmitZod } from '@/app/hooks/utils/use-form'
import { useCurAccountQuery } from '@/app/hooks/query/account/use-cur-account-query'
import { useCallback } from 'react'

const submitChange = async (data: AccountChangeNicknameReq) =>
  await jsonQ.Post<NullResp>('/account/change/nickname', data)

export const useUpdateNickname = () => {
  const { refetch } = useCurAccountQuery()
  const [formValue, setFormValue, resetForm]
    = useResetState<AccountChangeNicknameReq>({
      nickname: '',
    })
  const handleChangeNickname = useAreaChangeHandler(setFormValue, 'nickname')
  const handleAfterSuccess = useCallback(() => {
    resetForm()
    refetch()
  }, [refetch, resetForm])
  const handleSubmit = useSubmitZod(
    formValue,
    ZodCheckAccountChangeNicknameReq,
    submitChange,
    {
      successText: '修改昵称成功',
      errorText: '提交失败',
      afterSuccess: handleAfterSuccess,
    },
  )

  return {
    formValue,
    handleChangeNickname,
    handleSubmit,
  }
}
