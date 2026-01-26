import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'
import { useQuery } from '@tanstack/react-query'
import type { GetAllBotsResp } from '@shared/data-transfer/bot/manager'
import type { CommonBotInfo } from '@shared/common/bot/base'

/**
 * 获取所有机器人
 */
export const useBotsQuery = () => {
  return useQuery({
    queryKey: ['bots'],
    queryFn: async (): Promise<CommonBotInfo[]> => {
      const res = await jsonQ.Get<GetAllBotsResp>('/bots/list')
      if (res.statusCode !== Code.Ok || !res.data) throw new Error(res.message)

      return res.data
    },
  })
}
