import { useHealthSamplesQuery } from '@/app/hooks/query/health/use-health-samples-query'
import { useInterval } from 'ahooks'

export const useHealthCheck = () => {
  const { refetch } = useHealthSamplesQuery()
  useInterval(() => {
    refetch()
  }, 60 * 1e3)
}
