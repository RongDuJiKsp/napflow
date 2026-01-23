import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'
import { UserEntity, UserGroupEntity } from './models/account.entity'
import {
  WorkflowAppDataEntity,
  WorkflowAppEntity,
} from './models/workflow.entity'
import { BotRecordEntity } from './models/bot.entity'

@Injectable()
export class TypeOrmService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserGroupEntity)
    private readonly userGroupRepository: Repository<UserGroupEntity>,
    @InjectRepository(WorkflowAppEntity)
    private readonly workflowAppRepository: Repository<WorkflowAppEntity>,
    @InjectRepository(WorkflowAppDataEntity)
    private readonly workflowAppDataRepository: Repository<WorkflowAppDataEntity>,
    @InjectRepository(BotRecordEntity)
    private readonly botRecordRepository: Repository<BotRecordEntity>,
  ) {}

  // User 相关操作
  get user() {
    return this.userRepository
  }

  get userGroup() {
    return this.userGroupRepository
  }

  // Workflow 相关操作
  get workflowApp() {
    return this.workflowAppRepository
  }

  get workflowAppData() {
    return this.workflowAppDataRepository
  }

  // Bot 相关操作
  get botRecord() {
    return this.botRecordRepository
  }
}
