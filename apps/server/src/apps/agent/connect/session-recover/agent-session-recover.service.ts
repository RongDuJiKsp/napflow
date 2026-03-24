import { Injectable } from '@nestjs/common'
import type { RecoverableAgentSessionItem } from '@shared/data-transfer/agent/session'
import type { AgentSession } from '../instance'

export type NamespaceAppId = string
export type SessionId = string
@Injectable()
export class AgentSessionRecoverService {
  private readonly sessions = new Map<NamespaceAppId, Map<SessionId, AgentSession>>()

  nameSpaceMap(namespaceAppId: NamespaceAppId) {
    if (!this.sessions.has(namespaceAppId))
      this.sessions.set(namespaceAppId, new Map<SessionId, AgentSession>())

    return this.sessions.get(namespaceAppId)!
  }

  registerSession(namespaceAppId: NamespaceAppId, session: AgentSession) {
    this.nameSpaceMap(namespaceAppId).set(session.sessionId, session)
  }

  recoverSession(namespaceAppId: NamespaceAppId, sessionId: SessionId) {
    const session = this.nameSpaceMap(namespaceAppId).get(sessionId)
    return session || null
  }

  getRecoverableSessionList(namespaceAppId: NamespaceAppId): RecoverableAgentSessionItem[] {
    const sessions = this.nameSpaceMap(namespaceAppId)
    return Array.from(sessions.values()).map(session => ({
      sessionId: session.sessionId,
      title: session.langChain.chatSummary,
      createdAt: session.createdAt,
    }))
  }
}
