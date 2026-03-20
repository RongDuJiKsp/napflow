import { useAppsQuery } from '@/app/hooks/query/workflow/use-apps-query'
import { jsonQ } from '@/utils/net'
import { App } from 'antd'
import { useCallback } from 'react'
import { Code, type NullResp } from '@shared/data-transfer/_base'
import type { WorkflowApp } from '@shared/common/workflow/entity'

export const useAppActions = (app: WorkflowApp) => {
  const { message } = App.useApp()
  const { refetch } = useAppsQuery()

  const deleteApp = useCallback(async () => {
    const res = await jsonQ.Post<NullResp>(`/workflow/record/${app.appId}/delete`)
    if (res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('应用删除成功')
    await refetch()
  }, [app.appId, message, refetch])

  return { deleteApp }
}
