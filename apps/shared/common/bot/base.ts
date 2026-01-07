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
  stopped, // 当bot实例不存在于内存中时 此时为stopped
  running, // 当bot实例正在运行时 此时为running
  offline, // 当bot实例已断线但未被清理时 此时为offline
  fatal, // 当bot实例发生 fatal 错误时 此时为fatal
  killed, // 当bot实例被kill时 此时为killed
}
export enum BotSignal {
  SIGSTOP,
  SIGKILL,
}

export const ZodCheckBotState = z.object({
  runningState: z.enum(BotRunningState), // 运行状态
  lastExitCode: z.number().optional(), // 上次退出码
  exitSignal: z.enum(BotSignal).optional(), // 上次退出信号
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
