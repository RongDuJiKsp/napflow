import { useBotHealthCheckQuery } from '@/app/hooks/query/use-bot-health-check-query'
import { useInterval } from 'ahooks'
import { useBotParam } from '../../hooks/use-bot-param'

export const useHealthCheck = () => {
  const { botId } = useBotParam()
  const { refetch } = useBotHealthCheckQuery(botId)
  useInterval(() => {
    refetch()
  })
}
