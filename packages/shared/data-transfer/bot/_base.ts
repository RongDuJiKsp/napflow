import z from 'zod'

export enum AdapterTag {
  napcatWs,
}

// 带一些meta方便create
export type BotAdapter = {
  readonly adapterTag: AdapterTag
  readonly adapterDesc: string
}
export type BotAdapterClass = {
  readonly adapterMeta: BotAdapter
}

// bot状态
export enum BotRunningState {
  stopped,
  running,
  offline,
}

export const ZodCheckBotState = z.object({
  runningState: z.enum(BotRunningState), // 运行状态
  lastExitCode: z.number().optional(), // 上次退出码
  bootTime: z.date().optional(), // 启动时间
})
export type BotState = z.infer<typeof ZodCheckBotState>

export const ZodCheckCommonBotInfo = z.object({
  botId: z.string(),
  adapterTag: z.enum(AdapterTag),
  adapterDesc: z.string(),
  botDesc: z.string(),
  state: ZodCheckBotState,
})
export type CommonBotInfo = z.infer<typeof ZodCheckCommonBotInfo>
