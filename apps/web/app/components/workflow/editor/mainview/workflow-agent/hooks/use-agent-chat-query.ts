import { App } from 'antd'
import {
  ZodCheckWsMessageEventChatQuery,
} from '@shared/common/agent/socketio/events'
import { useCallback, useContext, useState } from 'react'
import { AgentWsConnContext } from './use-agent-chat'

export const useAgentChatQuery = () => {
  const { message } = App.useApp()

  const conn = useContext(AgentWsConnContext)
  const [query, setQuery] = useState('')

  const sendQuery = useCallback(
    (query: string) => {
      const validated = ZodCheckWsMessageEventChatQuery.safeParse({
        query: query.trim(),
      })
      if (!validated.success) {
        message.warning('请输入对话内容')
        return false
      }

      if (!conn || !conn.connected) {
        message.error('Agent 连接未就绪，请稍后重试')
        return false
      }

      conn.emit('query', validated.data)
      return true
    },
    [conn, message],
  )

  const submitQuery = () => {
    const sent = sendQuery(query)
    if (sent) setQuery('')
  }

  return {
    query,
    setQuery,
    submitQuery,
  }
}
