import { Inject, Injectable } from '@nestjs/common'
import { TypeOrmService } from '../../db/typeorm.service'
import { LangChainInstance } from './instance'

@Injectable()
export class LangChainService {
  constructor(@Inject(TypeOrmService) private readonly typeOrmService: TypeOrmService) {

  }

  async createLangChainInstanceByEndpointRecordId(endpointId: string) {
    const endpointRecord = await this.typeOrmService.openAiEndpoint.findOneBy({ id: endpointId })
    if(!endpointRecord)
      return null

    return new LangChainInstance(endpointRecord)
  }
}
