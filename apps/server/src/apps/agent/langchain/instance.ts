import type { OpenAiEndpointConfig } from '@shared/common/agent/entity'
import type { ClientTool, ServerTool } from '@langchain/core/tools'
import type { AgentMiddleware, BaseMessage } from 'langchain'
import { HumanMessage, createAgent } from 'langchain'
import { ChatOpenAI } from '@langchain/openai'
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import { Logger } from '@nestjs/common'

export type LangChainConfig = {
  tools?: (ClientTool | ServerTool)[];
  middleware?: AgentMiddleware[];
}
// 对 LangChain sdk的包装，提供一些默认的功能和接口的包装，方便在 LangChainInstance 中使用
class LangChainBase {
  private readonly logger = new Logger(LangChainBase.name)
  private readonly openAiSdk: ChatOpenAI
  private readonly agent: ReturnType<typeof createAgent>

  constructor(
    private readonly endpoint: OpenAiEndpointConfig,
    private readonly config: LangChainConfig = {},
  ) {
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

  get self() {
    return this
  }

  private async streamingInvokeIterator(
    beforeMessages: BaseMessage[],
  ): Promise<() => AsyncGenerator<BaseMessage[], void>> {
    const streamingResponse = await this.agent.stream({
      messages: beforeMessages,
    })
    const self = this.self
    return async function* () {
      for await (const chunk of streamingResponse) {
        self.logger.debug('Received new chunk from streaming response', {
          chunk,
        })
        yield chunk.model_request?.messages || chunk.tools?.messages || []
      }
    }
  }

  async streamingInvoke(beforeMessages: BaseMessage[]) {
    return (await this.streamingInvokeIterator(beforeMessages))()
  }
}

export class LangChainInstance extends LangChainBase {
  // memory
  private readonly memory = new InMemoryChatMessageHistory()

  private summary = '未摘要对话'

  get chatSummary() {
    return this.summary
  }

  async invokeChat(input: string) {
    const history = await this.memory.getMessages()
    const messages = await this.stateInvoke([
      ...history,
      new HumanMessage(input),
    ])
    await this.memory.clear()
    await this.memory.addMessages(messages)
    return {
      current: messages,
      diff: messages.slice(history.length), // 只返回新产生的消息
    }
  }

  async invokeStreamingChat(
    input: string,
    onUpdate: (message: BaseMessage) => void,
  ) {
    const history = await this.memory.getMessages()
    const messages = [...history, new HumanMessage(input)]
    await this.memory.addMessages(messages) // 先把用户输入的消息存储到 memory 中，这样在 streaming 过程中就能拿到完整的对话历史
    for await (const respMsgs of await this.streamingInvoke(messages)) {
      await this.memory.addMessages(respMsgs)
      respMsgs.forEach(onUpdate)
    }
    const current = await this.memory.getMessages()
    return {
      current,
      diff: current.slice(history.length), // 只返回新产生的消息
    }
  }

  async getStoredMessages() {
    return (await this.memory.getMessages()).map(msg => msg.toDict())
  }
}
