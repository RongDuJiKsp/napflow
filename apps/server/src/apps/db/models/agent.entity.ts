import type { OpenAiEndpointConfigRecord } from '@shared/common/agent/entity'
import { BaseEntity, Entity, PrimaryColumn } from 'typeorm'
import { NotNullColumn } from '../decorator/entity'

@Entity('openai_endpoint')
export class OpenAiEndpointEntity extends BaseEntity implements OpenAiEndpointConfigRecord {
  @PrimaryColumn({ generated: 'uuid' })
  id: string

  @NotNullColumn()
  endpoint: string

  @NotNullColumn()
  apiKey: string

  @NotNullColumn()
  model: string
}
