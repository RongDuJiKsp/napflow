import type { BotRecordEntity } from '@/src/apps/db/models/bot.entity'
import type { BotAdapter, BotSignal, BotState } from '@shared/common/bot/base'

// 可被数据库存储的Bot实例
export type BotDBInstance = {
  readonly botConfigDB: BotRecordEntity
}

export type BotHealthCheckable = {
  runningState: () => BotState
  signal: (signal: BotSignal) => void
}
// Bot实例 设计思路： bot实例可被db存储配置 启动时从数据库运行 （BotDBInstance） ；每个bot实例可以连接到一个上游适配器
export type BotInstance = BotAdapter & BotDBInstance & BotHealthCheckable

// 从record 启用一个实例的函数
export type BotAdapterFactory = (entity: BotRecordEntity) => BotInstance | Promise<BotInstance>

export type Registerable = {
  register: () => void;
  unregister: () => void;
}
