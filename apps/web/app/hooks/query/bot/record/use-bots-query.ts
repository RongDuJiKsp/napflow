import { jsonQ } from '@/utils/net'
import { useQuery } from '@tanstack/react-query'
import { ZodCheckGetAllBotsResp } from '@shared/data-transfer/bot/manager'
import type { GetAllBotsResp } from '@shared/data-transfer/bot/manager'
import { defineZodQueryFn } from '../../_base'

/**
 * 获取所有机器人
 */
export const useBotsQuery = () => {
  return useQuery({
    queryKey: ['bots'],
    queryFn: defineZodQueryFn(
      ZodCheckGetAllBotsResp,
      async () => await jsonQ.Get<GetAllBotsResp>('/bot/record/list'),
    ),
  })
}
