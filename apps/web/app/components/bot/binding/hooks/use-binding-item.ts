import { useBindingBotQuery } from '@/app/hooks/query/bot/bridge/use-binding-bot-query'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import type { BotBridgeUnbindReq } from '@shared/data-transfer/bot/bridge'
import { App } from 'antd'
import { useCallback } from 'react'

export const useBindingItem = (botId: string, bindingId: string) => {
  const { message } = App.useApp()
  const { refetch } = useBindingBotQuery(botId)
  const handleUnbind = useCallback(async () => {
    const req: BotBridgeUnbindReq = { bindingIds: [bindingId] }
    const res = await jsonQ.Post<NullResp>(
      `/bot/bridge/${botId}/unbindmany`,
      req,
    )
    if (res.statusCode !== 200) {
      message.error(`解绑失败：${res.message}`)
      return
    }
    await refetch()
  }, [botId, bindingId, message, refetch])

  return {
    handleUnbind,
  }
}
