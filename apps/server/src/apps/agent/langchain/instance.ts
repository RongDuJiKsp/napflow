import type { OpenAiEndpointConfig } from '@shared/common/agent/entity'
import type { ClientTool, ServerTool } from '@langchain/core/tools'
import type { AgentMiddleware, BaseMessage } from 'langchain'
import { HumanMessage, createAgent } from 'langchain'
import { ChatOpenAI } from '@langchain/openai'
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'

export type LangChainConfig = { tools?: (ClientTool | ServerTool)[], middleware?: AgentMiddleware[] }
// 对 LangChain sdk的包装，提供一些默认的功能和接口的包装，方便在 LangChainInstance 中使用
class LangChainBase {
  private readonly openAiSdk: ChatOpenAI
  private readonly agent: ReturnType<typeof createAgent>

  constructor(private readonly endpoint: OpenAiEndpointConfig, private readonly config: LangChainConfig = {}) {
    this.openAiSdk = new ChatOpenAI({
      model: endpoint.model,
      apiKey: endpoint.apiKey,
      configuration: {
        baseURL: endpoint.endpoint,
      },
    })
    this.agent = createAgent({
      model: this.openAiSdk,
      middleware: [...(config.middleware || [])],
      tools: [...(config.tools || [])],
    })
  }

  async stateInvoke(beforeMessages: BaseMessage[]): Promise<BaseMessage[]> {
    return (await this.agent.invoke({ messages: beforeMessages })).messages
  }
}

export class LangChainInstance extends LangChainBase {
  // memory
  private readonly memory = new InMemoryChatMessageHistory()

  private summary = ' 未摘要对话'

  get chatSummary() {
    return this.summary
  }

  async invokeChat(input: string) {
    const history = await this.memory.getMessages()
    const messages = await this.stateInvoke([...history, new HumanMessage(input)])
    await this.memory.clear()
    await this.memory.addMessages(messages)
    return{
      current: messages,
      diff: messages.slice(history.length), // 只返回新产生的消息
    }
  }

  async getMessagesAsJson() {
    return (await this.memory.getMessages()).map(msg => msg.toJSON())
  }
}
