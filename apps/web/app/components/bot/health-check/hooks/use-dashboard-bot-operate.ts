import { useBotsQuery } from '@/app/hooks/query/bot/record/use-bots-query'
import { useCallback, useMemo } from 'react'
import { useBotParam } from '../../hooks/use-bot-param'
import { useBotState } from '../../bot-list/hooks/use-bot-state'
import { useBotRestfulApi } from '../../bot-list/hooks/use-bot-operate'

/**
 * Dashboard页面专用的Bot操作Hook
 * 从bot列表中查找当前bot信息，提供操作按钮和状态判断
 */
export const useDashboardBotOperate = () => {
  const { botId } = useBotParam()
  const { data: bots, refetch } = useBotsQuery()

  const currentBot = useMemo(
    () => bots?.find(bot => bot.botId === botId) ?? null,
    [bots, botId],
  )

  const botState = useBotState(currentBot ?? undefined)

  const onSuccess = useCallback(async () => {
    await refetch()
  }, [refetch])

  const startBot = useBotRestfulApi(botId, 'run', {
    successMsg: 'Bot启动成功',
    onSuccess,
  })
  const stopBot = useBotRestfulApi(botId, 'stop', {
    successMsg: '已发送停止信号',
    onSuccess,
  })
  const killBot = useBotRestfulApi(botId, 'kill', {
    successMsg: '已发送终止信号',
    onSuccess,
  })
  const reloadBot = useBotRestfulApi(botId, 'reload', {
    successMsg: 'Bot重拉成功',
    onSuccess,
  })

  return {
    currentBot,
    botState,
    startBot,
    stopBot,
    killBot,
    reloadBot,
  }
}
