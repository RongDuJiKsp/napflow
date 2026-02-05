import type { AggregatedMetrics } from '@shared/common/health-check/health-check'
import { defineQueryFn } from './_base'
import type { HealthCheckSamplesResp } from '@shared/data-transfer/health-check/samples'
import { jsonQ } from '@/utils/net'
import { useQuery } from '@tanstack/react-query'
export const useHealthSamplesQuery = () => {
  return useQuery({
    queryKey: ['health-samples'],
    queryFn: defineQueryFn<HealthCheckSamplesResp, AggregatedMetrics[]>(async () => await jsonQ.Get<HealthCheckSamplesResp>('/health/samples')),
  })
}
