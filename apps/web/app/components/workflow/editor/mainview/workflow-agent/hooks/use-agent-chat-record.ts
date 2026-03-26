import { useContext, useEffect, useState } from 'react'
import { AgentWsConnContext } from './use-agent-chat'
import type { BaseMessage, StoredMessage } from '@langchain/core/messages'
import { mapStoredMessageToChatMessage } from '@langchain/core/messages'

export const useAgentChatRecord = () => {
  const conn = useContext(AgentWsConnContext)
  const [records, setRecords] = useState<BaseMessage[]>([])

  useEffect(() => {
    if (!conn) return

    const handleIncomingRecord = (msgJson: StoredMessage) => {
      const message = mapStoredMessageToChatMessage(msgJson)
      setRecords(prev => [...prev, message])
    }

    conn.on('query.response', handleIncomingRecord)
    return () => {
      conn.off('query.response', handleIncomingRecord)
    }
  }, [conn])

  return {
    hasRecords: records.length > 0,
    records,
  }
}
