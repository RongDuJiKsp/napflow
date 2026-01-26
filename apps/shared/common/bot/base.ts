import z from 'zod'

export enum AdapterTag {
  napcatWs,
}

// 带一些meta方便create
export type BotAdapter = {
  readonly tag: AdapterTag
  readonly desc: string
}
export type BotAdapterClass = {
  readonly meta: BotAdapter
}

// bot状态
export enum BotRunningState {
  stopped = 'stopped', // 当bot实例不存在于内存中时 此时为stopped
  running = 'running', // 当bot实例正在运行时 此时为running
  offline = 'offline', // 当bot实例无法和上游通信时 此时为offline
  fatal = 'fatal', // 当bot实例发生 fatal 错误时 此时为fatal
  killed = 'killed', // 当bot实例被kill时 此时为killed
}
export const BotRunningStateUtils = {
  runningStates: [BotRunningState.running, BotRunningState.offline],
  isRunning: (state: BotRunningState) => BotRunningStateUtils.runningStates.includes(state),
  isStoped: (state: BotRunningState) => !BotRunningStateUtils.runningStates.includes(state),
}

// 上游服务状态
export enum BotUpstreamState {
  ok = 'ok', // 上游服务正常运行
  offline = 'offline', // 上游服务已经离线
  fatal = 'fatal', // 上游服务自身发生异常
}
export enum BotSignal {
  SIGSTOP = 'SIGSTOP', // 优雅退出
  SIGKILL = 'SIGKILL', // 强制退出
}

export const ZodCheckBotState = z.object({
  runningState: z.enum(BotRunningState), // 运行状态
  upStreamState: z.enum(BotUpstreamState).optional(), // 上游状态
  lastExitCode: z.number().optional(), // 上次退出码
  exitSignal: z.enum(BotSignal).optional(), // 上次退出信号
  bootTime: z.date().optional(), // 启动时间
})
export type BotState = z.infer<typeof ZodCheckBotState>

export const ZodCheckCommonBotInfo = z.object({
  botId: z.string(),
  adapterTag: z.enum(AdapterTag),
  adapterDesc: z.string(),
  botName: z.string(),
  botDesc: z.string(),
  state: ZodCheckBotState,
})
export type CommonBotInfo = z.infer<typeof ZodCheckCommonBotInfo>
