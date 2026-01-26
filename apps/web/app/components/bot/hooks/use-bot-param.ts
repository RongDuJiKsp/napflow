import { createParamContext } from '@/utils/react'

export type BotParam = {
  botId: string
}
const { context: BotParamContext, useContextHook: useBotParam } = createParamContext<BotParam>('BotParam')
export { BotParamContext, useBotParam }
