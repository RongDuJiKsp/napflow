import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { OpenAiEndpointConfig } from '@shared/common/agent/entity'

const API_KEY_MASK_END_LENGTH = 6

@Injectable()
export class AgentService {
  constructor(@Inject(TypeOrmService) private readonly db: TypeOrmService) {}

  async getOpenAiEndpointList() {
    return await this.db.openAiEndpoint.find()
  }

  async getOpenAiEndpointListToShow() {
    return (await this.getOpenAiEndpointList()).map(config => ({
      id: config.id,
      endpoint: config.endpoint,
      model: config.model,
      apiKey: `${config.apiKey.slice(0, API_KEY_MASK_END_LENGTH)}****${config.apiKey.slice(-API_KEY_MASK_END_LENGTH)}`,
    }))
  }

  async createOpenAiEndpoint(config: OpenAiEndpointConfig) {
    return await this.db.openAiEndpoint.save(config)
  }

  async updateOpenAiEndpoint(id: string, config: Partial<OpenAiEndpointConfig>) {
    const endpoint = await this.db.openAiEndpoint.findOne({
      where: { id },
    })
    if (!endpoint) return null

    endpoint.endpoint = config.endpoint || endpoint.endpoint
    endpoint.apiKey = config.apiKey || endpoint.apiKey
    endpoint.model = config.model || endpoint.model

    return await this.db.openAiEndpoint.save(endpoint)
  }

  async deleteOpenAiEndpoint(id: string) {
    return await this.db.openAiEndpoint.delete({ id })
  }
}
