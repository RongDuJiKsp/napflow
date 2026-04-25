import type { AggregatedMetrics } from '@shared/common/health-check/health-check'
import { defineZodQueryFn } from '../_base'
import { ZodCheckHealthCheckSamplesResp } from '@shared/data-transfer/health-check/samples'
import type { HealthCheckSamplesResp } from '@shared/data-transfer/health-check/samples'
import { jsonQ } from '@/utils/net'
import { useQuery } from '@tanstack/react-query'
export const useHealthSamplesQuery = () => {
  return useQuery({
    queryKey: ['health-samples'],
    queryFn: defineZodQueryFn(ZodCheckHealthCheckSamplesResp,
      async () => await jsonQ.Get<HealthCheckSamplesResp>('/health/samples'),
    ),
  })
}
