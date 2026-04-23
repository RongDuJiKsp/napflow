import { useQuery } from '@tanstack/react-query'
import type { InternErrorDashboardData } from '@/utils/data-report/shared/error-report-contract'

type DataReportDashboardResp = {
  ok: boolean;
  message?: string;
  data?: InternErrorDashboardData;
}

const queryDashboardData = async () => {
  const response = await fetch('/__intern_view__/dashboard-data', {
    method: 'GET',
    cache: 'no-store',
  })

  if (!response.ok)
    throw new Error(`请求失败: ${response.status}`)

  const body = await response.json() as DataReportDashboardResp
  if (!body.ok || !body.data)
    throw new Error(body.message || '面板数据解析失败')

  return body.data
}

export const useDataReportDashboardQuery = () => {
  return useQuery({
    queryKey: ['data-report-dashboard'],
    queryFn: queryDashboardData,
    refetchInterval: 5000,
  })
}
