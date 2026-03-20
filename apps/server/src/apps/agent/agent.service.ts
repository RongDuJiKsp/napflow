import { TypeOrmService } from '@/src/apps/db/typeorm.service'
import { Inject, Injectable } from '@nestjs/common'
import type { OpenAiEndpointConfig } from '@shared/common/agent/entity'

@Injectable()
export class AgentService {
  constructor(@Inject(TypeOrmService) private readonly db: TypeOrmService) {}

  async getOpenAiEndpointList() {
    return await this.db.openAiEndpoint.find()
  }

  async createOpenAiEndpoint(config: OpenAiEndpointConfig) {
    return await this.db.openAiEndpoint.save(config)
  }

  async updateOpenAiEndpoint(id: string, config: OpenAiEndpointConfig) {
    const endpoint = await this.db.openAiEndpoint.findOne({
      where: { id },
    })
    if (!endpoint) return null

    endpoint.endpoint = config.endpoint
    endpoint.apiKey = config.apiKey
    endpoint.model = config.model

    return await this.db.openAiEndpoint.save(endpoint)
  }

  async deleteOpenAiEndpoint(id: string) {
    return await this.db.openAiEndpoint.delete({ id })
  }
}
