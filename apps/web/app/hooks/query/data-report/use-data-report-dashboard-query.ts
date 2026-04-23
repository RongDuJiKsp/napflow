import { useQuery } from '@tanstack/react-query'
import type { DataReportDashboardResp } from '@/utils/data-report/shared/error-report-contract'
import { jsonIntern } from '@/utils/net'

export const useDataReportDashboardQuery = () => {
  return useQuery({
    queryKey: ['data-report-dashboard'],
    queryFn: async () => {
      const body = await jsonIntern.Get<DataReportDashboardResp>(
        '/__intern_view__/dashboard-data',
      )
      if (!body.ok || !body.data)
        throw new Error(body.message || '面板数据解析失败')
      return body.data
    },
    refetchInterval: 5000,
  })
}
