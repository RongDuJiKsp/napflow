import { jsonQ } from '@/utils/net'
import type { WorkflowAppData } from '@shared/common/workflow/base'
import { Code } from '@shared/data-transfer/_base'
import type { LoadDraftResp } from '@shared/data-transfer/workflow/info'
import { useQuery } from '@tanstack/react-query'

export const useWorkflowAppDataQuery = (appId: string) => {
  return useQuery({
    queryKey: ['workflow-app-data', appId],
    queryFn: async (): Promise<WorkflowAppData> => {
      const res = await jsonQ.Get<LoadDraftResp>(`/workflow/${appId}/draft`)
      if (res.statusCode !== Code.Ok || !res.data)
        throw new Error(res.message)
      return res.data
    },
  })
}
