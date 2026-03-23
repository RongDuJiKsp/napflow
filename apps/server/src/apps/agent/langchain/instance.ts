import type { OpenAiEndpointConfig } from '@shared/common/agent/entity'
import type { ClientTool } from '@langchain/core/tools'
import { HumanMessage, createAgent, createMiddleware } from 'langchain'
import { ChatOpenAI } from '@langchain/openai'
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
/**
 * @description LangChainDynamicTool 用于动态添加工具到 LangChain Agent 中
 */
export class LangChainDynamicTool {
  private readonly dynTools: ClientTool[] = []
  private readonly dynToolDict = new Map<string, ClientTool>()
  private readonly dynToolCallMiddleware = createMiddleware({
    name: 'dynToolCallMiddleware',
    wrapModelCall: (req, handler) => {
      return handler({
        ...req,
        tools: [...req.tools, ...this.dynTools],
      })
    },
    wrapToolCall: (req, handler) => {
      const dynTool = this.dynToolDict.get(String(req.tool?.name ?? ''))
      if (dynTool) {
        return handler({
          ...req,
          tool: dynTool,
        })
      }
      return handler(req)
    },
  })

  get middleware() {
    return this.dynToolCallMiddleware
  }

  addTool(tool: ClientTool) {
    if (this.dynToolDict.has(tool.name))
      throw new Error(`Tool with name ${tool.name} already exists`)
    this.dynTools.push(tool)
    this.dynToolDict.set(tool.name, tool)
  }
}

export class LangChainInstance {
  // models and agent
  private readonly openAiSdk: ChatOpenAI
  private readonly agent: ReturnType<typeof createAgent>

  // tool calls
  readonly dynTool = new LangChainDynamicTool()

  // memory
  private readonly memory = new InMemoryChatMessageHistory()

  constructor(private readonly endpoint: OpenAiEndpointConfig) {
    this.openAiSdk = new ChatOpenAI({
      model: endpoint.model,
      apiKey: endpoint.apiKey,
      configuration: {
        baseURL: endpoint.apiKey,
      },
    })
    this.agent = createAgent({
      model: this.openAiSdk,
      middleware: [this.dynTool.middleware],
    })
  }

  async invokeChat(input: string) {
    const history = await this.memory.getMessages()
    const result = await this.agent.invoke({
      messages: [...history, new HumanMessage(input)],
    })
    this.memory.addMessages(result.messages)
  }

  async getMessagesAsJson() {
    return (await this.memory.getMessages()).map(msg => msg.toJSON())
  }
}
