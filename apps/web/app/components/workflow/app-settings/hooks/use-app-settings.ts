import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { useSubmitZod } from '@/app/hooks/utils/use-form'
import { useAppMetaQuery } from '@/app/hooks/query/use-app-meta-query'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import {
  type UpdateWorkflowReq,
  ZodCheckUpdateWorkflowReq,
} from '@shared/data-transfer/workflow/info'
import { useResetState } from 'ahooks'
import { useCallback, useEffect, useState } from 'react'
import { useAppParam } from '../../hooks/use-app-param'

export const useAppSettings = () => {
  const { appId } = useAppParam()
  const { data: appMeta, refetch } = useAppMetaQuery(appId)
  const [isOpen, setIsOpen] = useState(false)

  const [formValue, setFormValue] = useResetState<UpdateWorkflowReq>({
    appName: '',
    appDescription: '',
  })

  // 当弹窗打开且获取到app信息后，填充表单
  useEffect(() => {
    if (isOpen && appMeta) {
      setFormValue({
        appName: appMeta.appName,
        appDescription: appMeta.appDescription,
      })
    }
  }, [isOpen, appMeta, setFormValue])

  const handleChangeAppName = useAreaChangeHandler(setFormValue, 'appName')
  const handleChangeAppDescription = useAreaChangeHandler(
    setFormValue,
    'appDescription',
  )

  const submitFn = useCallback(
    async (data: UpdateWorkflowReq) =>
      await jsonQ.Post<NullResp>(`/workflow/${appId}/update`, data),
    [appId],
  )

  const handleSubmit = useSubmitZod(
    formValue,
    ZodCheckUpdateWorkflowReq,
    submitFn,
    {
      successText: '更新工作流信息成功',
      errorText: '提交失败',
      afterSuccess: () => {
        refetch()
        setIsOpen(false)
      },
    },
  )

  const handleOpen = useCallback(() => setIsOpen(true), [])
  const handleClose = useCallback(() => setIsOpen(false), [])

  return {
    isOpen,
    formValue,
    handleOpen,
    handleClose,
    handleChangeAppName,
    handleChangeAppDescription,
    handleSubmit,
  }
}
