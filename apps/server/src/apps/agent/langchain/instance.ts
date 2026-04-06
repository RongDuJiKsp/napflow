import type { OpenAiEndpointConfig } from '@shared/common/agent/entity'
import type { ClientTool, ServerTool } from '@langchain/core/tools'
import type { AgentMiddleware, BaseMessage } from 'langchain'
import { createAgent } from 'langchain'
import { ChatOpenAI } from '@langchain/openai'
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { Logger } from '@nestjs/common'

export type LangChainConfig = {
  tools?: (ClientTool | ServerTool)[];
  middleware?: AgentMiddleware[];
}

const NAPFLOW_PROJECT_CONTEXT = [
  '你是 NapFlow 项目的 AI 开发助手。',
  'NapFlow 是一个面向业务自动化的工作流编排平台，支持通过节点与流程来设计、执行和管理自动化任务。',
  '你的核心任务是理解用户意图，协助用户在 NapFlow 中完成流程设计、节点配置、调试排错和运行优化。',
  '在回答时优先使用工作流场景语义：节点、连线、触发器、执行上下文、输入输出、运行结果与日志。',
].join('\n')

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
  private readonly initialProjectMemory = new SystemMessage(NAPFLOW_PROJECT_CONTEXT)

  private summary = '未摘要对话'

  private async ensureInitialMemory() {
    const history = await this.memory.getMessages()
    if (history.length > 0)
      return

    await this.memory.addMessages([this.initialProjectMemory])
  }

  get chatSummary() {
    return this.summary
  }

  async invokeChat(input: string) {
    await this.ensureInitialMemory()
    const history = await this.memory.getMessages()
    const messages = await this.stateInvoke([
      ...history,
      new HumanMessage(input),
    ])
    await this.memory.clear()
    await this.memory.addMessages(messages) // invoke的调用包含全部上下文 因此直接覆盖原有的 memory 即可
    return {
      current: messages,
      diff: messages.slice(history.length), // 只返回新产生的消息
    }
  }

  async invokeStreamingChat(
    input: string,
    onUpdate: (message: BaseMessage) => void,
  ) {
    await this.ensureInitialMemory()
    const history = await this.memory.getMessages()
    const messages = [...history, new HumanMessage(input)]
    await this.memory.addMessages(messages) // 先把用户输入的消息存储到 memory 中，这样在 streaming 过程中就能拿到完整的对话历史
    for await (const respMsgs of await this.streamingInvoke(messages)) {
      await this.memory.addMessages(respMsgs) // stream的上下文是增量的，因此每次都把新产生的消息追加到 memory 中
      respMsgs.forEach(onUpdate)
    }
    const current = await this.memory.getMessages()
    return {
      current,
      diff: current.slice(history.length), // 只返回新产生的消息
    }
  }

  async getStoredMessages() {
    await this.ensureInitialMemory()
    // 过滤掉 system 消息，外部不需要感知到系统消息的存在
    return (await this.memory.getMessages())
      .map(msg => msg.toDict())
      .filter(msg => msg.type !== 'system')
  }
}
