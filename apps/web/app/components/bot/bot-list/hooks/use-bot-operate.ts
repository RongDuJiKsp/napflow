import { useBotsQuery } from '@/app/hooks/query/bot/bots/use-bots-query'
import { jsonQ } from '@/utils/net'
import type { CommonBotInfo } from '@shared/common/bot/base'
import type { NullResp } from '@shared/data-transfer/_base'
import { Code } from '@shared/data-transfer/_base'
import { App } from 'antd'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export const useBotRestfulApi = (
  botId: string,
  action: string,
  {
    successMsg,
    onSuccess,
  }: { successMsg?: string; onSuccess?: () => void | Promise<void> } = {},
) => {
  const { message } = App.useApp()
  return useCallback(async () => {
    const res = await jsonQ.Post<NullResp>(`/bot/runtime/${botId}/${action}`)
    if (res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success(successMsg)
    await onSuccess?.()
  }, [action, message, successMsg, onSuccess, botId])
}

export const useBotOperate = (bot: CommonBotInfo) => {
  const { refetch } = useBotsQuery()
  const onSuccess = useCallback(async () => {
    await refetch()
  }, [refetch])

  const startBot = useBotRestfulApi(bot.botId, 'run', {
    successMsg: 'Bot启动成功',
    onSuccess,
  })
  const stopBot = useBotRestfulApi(bot.botId, 'stop', {
    successMsg: '已发送停止信号',
    onSuccess,
  })
  const killBot = useBotRestfulApi(bot.botId, 'kill', {
    successMsg: '已发送终止信号',
    onSuccess,
  })
  const reloadBot = useBotRestfulApi(bot.botId, 'reload', {
    successMsg: 'Bot重拉成功',
    onSuccess,
  })
  return { startBot, stopBot, killBot, reloadBot }
}

export const useBotInfoOperator = (bot: CommonBotInfo) => {
  const router = useRouter()
  const { message } = App.useApp()
  const { refetch } = useBotsQuery()
  const editBot = useCallback(() => {
    router.push(`/bots/${bot.botId}/edit`)
  }, [bot, router])
  const deleteBot = useCallback(async () => {
    const res = await jsonQ.Post<NullResp>(`/bot/record/${bot.botId}/delete`)
    if (res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('Bot删除成功')
    await refetch()
  }, [bot, message, refetch])
  return { editBot, deleteBot }
}
