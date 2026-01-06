import type { BotRecordEntity } from '@/src/apps/db/models/bot.entity'

export enum AdapterTag {
  napcatWs,
}

// 带一些meta方便create 这玩意对前端透明
export type BotAdapter = {
  readonly adapterTag: AdapterTag
  readonly adapterDesc: string
}
// 可被数据库存储的Bot实例
export type BotDBInstance = {
  readonly botConfigDB: BotRecordEntity
}
// Bot实例 设计思路： bot实例可被db存储配置 启动时从数据库运行 （BotDBInstance） ；每个bot实例可以连接到一个上游适配器
export type BotInstance = BotAdapter & BotDBInstance

export type BotAdapterFactory = (entity: BotRecordEntity) => BotInstance
