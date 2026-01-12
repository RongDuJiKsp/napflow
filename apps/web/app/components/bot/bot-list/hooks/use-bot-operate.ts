import { useBotsQuery } from '@/app/hooks/query/use-bots-query'
import { jsonQ } from '@/utils/net'
import type { CommonBotInfo } from '@shared/common/bot/base'
import type { NullResp } from '@shared/data-transfer/_base'
import { Code } from '@shared/data-transfer/_base'
import { App } from 'antd'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export const useBotOperate = (bot: CommonBotInfo) => {
  const { message } = App.useApp()
  const { refetch } = useBotsQuery()
  const startBot = useCallback(async () => {
    const res = await jsonQ.Post<NullResp>(`bots/${bot.botId}/run`)
    if(res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('Bot启动成功')
    await refetch()
  }, [bot, message, refetch])
  return { startBot }
}

export const useBotInfoOperator = (bot: CommonBotInfo) => {
  const router = useRouter()
  const { message } = App.useApp()
  const { refetch } = useBotsQuery()
  const editBot = useCallback(() => {
    router.push(`/bots/${bot.botId}/edit`)
  }, [bot, router])
  const deleteBot = useCallback(async () => {
    const res = await jsonQ.Post<NullResp>(`bots/${bot.botId}/delete`)
    if(res.statusCode !== Code.Ok) {
      message.error(res.message)
      return
    }
    message.success('Bot删除成功')
    await refetch()
  }, [bot, message, refetch])
  return { editBot, deleteBot }
}
