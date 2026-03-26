import type { OpenAiEndpointConfig } from '@shared/common/agent/entity'
import type { ClientTool, ServerTool } from '@langchain/core/tools'
import type { AgentMiddleware } from 'langchain'
import { HumanMessage, createAgent } from 'langchain'
import { ChatOpenAI } from '@langchain/openai'
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'

export type LangChainConfig = { tools?: (ClientTool | ServerTool)[], middleware?: AgentMiddleware[] }
export class LangChainInstance {
  // models and agent
  private readonly openAiSdk: ChatOpenAI
  private readonly agent: ReturnType<typeof createAgent>

  // memory
  private readonly memory = new InMemoryChatMessageHistory()

  private summary = ' 未摘要对话'

  get chatSummary() {
    return this.summary
  }

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

  async invokeChat(input: string) {
    const history = await this.memory.getMessages()
    const result = await this.agent.invoke({
      messages: [...history, new HumanMessage(input)],
    })
    this.memory.addMessages(result.messages)
    return result
  }

  async getMessagesAsJson() {
    return (await this.memory.getMessages()).map(msg => msg.toJSON())
  }
}
