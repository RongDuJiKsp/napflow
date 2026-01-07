import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'
import { NotNullColumn } from '../decorator/entity'
import type { CommonAdapterConfig } from '@shared/common/bot/adapter'
import type { JsonObject } from 'type-fest'
import { AdapterTag } from '@shared/common/bot/base'

// 每一个BotRecord对应配置好的机器人endpoint
@Entity()
export class BotRecordEntity {
    // id
  @PrimaryColumn({ generated: 'uuid' })
  recordId: string

    // 机器人名称
  @NotNullColumn()
  name: string

  // 机器人描述
  @NotNullColumn()
  description: string

  // 通用适配器配置
  @NotNullColumn({ type: 'json' })
  commonAdapterConfig: CommonAdapterConfig

  // 机器人的适配器tag
  @NotNullColumn({ type: 'enum', enum: AdapterTag })
  adapterTag: AdapterTag

  // 适配器配置
  @NotNullColumn({ type: 'json' })
  adapterConfig: JsonObject

  @CreateDateColumn()
  createdAt: Date

  @NotNullColumn()
  createdBy: string
}
