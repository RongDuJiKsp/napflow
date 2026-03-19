import { jsonQ } from '@/utils/net'
import { useQuery } from '@tanstack/react-query'
import type { GetAllBotsResp } from '@shared/data-transfer/bot/manager'
import type { CommonBotInfo } from '@shared/common/bot/base'
import { defineQueryFn } from '../../_base'

/**
 * 获取所有机器人
 */
export const useBotsQuery = () => {
  return useQuery({
    queryKey: ['bots'],
    queryFn: defineQueryFn<GetAllBotsResp, CommonBotInfo[]>(
      async () => await jsonQ.Get<GetAllBotsResp>('/bots/list'),
    ),
  })
}
