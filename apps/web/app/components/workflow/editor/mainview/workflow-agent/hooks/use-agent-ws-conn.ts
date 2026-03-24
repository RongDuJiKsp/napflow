import { useAppParam } from '@/app/components/workflow/hooks/use-app-param'
import { baseUrl } from '@/config/env'
import type { WsConnectionRequest } from '@shared/common/agent/websocket'
import { useCreation } from 'ahooks'
import { useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

export enum AgentWsConnType {
  NewConnection = 'new_connection',
  RecoveryConnection = 'recovery_connection',
}

export const serdeConnToken = (type: AgentWsConnType, id: string): string => {
  return `${type}:${id}`
}
export const parseConnToken = (token: string): { type: AgentWsConnType, id: string } | null => {
  const [type, id] = token.split(':')
  if (!type || !id) return null
  return { type: type as AgentWsConnType, id }
}

const createConnection = (recordId: string, appId: string) => {
  return io('/agent', {
    path: `${baseUrl}/socket.io`, auth: <Pick<WsConnectionRequest, 'auth' | 'model'>>{
      auth: { token: localStorage.getItem('auth-token') },
      model: {
        appId,
        recordId,
      },
    },
  })
}
const createRecoveryConnection = (recoverId: string, appId: string) => {
  return io('/agent', {
    path: `${baseUrl}/socket.io`, auth: <Pick<WsConnectionRequest, 'auth' | 'recovery'>>{
      auth: { token: localStorage.getItem('auth-token') },
      recovery: {
        socketSessionId: recoverId,
        appId,
      },
    },
  })
}

export const useAgentWsConn = (connToken: string, onCreated?: (conn: Socket) => void) => {
  const { appId } = useAppParam()

  const wsConn = useCreation(() => {
    const { type, id } = parseConnToken(connToken) || {}
    if (type === AgentWsConnType.NewConnection && id && appId)
      return createConnection(id, appId)

    if (type === AgentWsConnType.RecoveryConnection && id && appId)
      return createRecoveryConnection(id, appId)

    return null
  }, [connToken, appId])

  useEffect(() => {
    if(wsConn)
      onCreated?.(wsConn)
  }, [wsConn, onCreated])

  useEffect(() => {
    return () => {
      wsConn?.disconnect()
    }
  }, [wsConn])
  return wsConn
}
