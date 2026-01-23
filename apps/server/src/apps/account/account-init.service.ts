import { Inject, Injectable, Logger } from '@nestjs/common'
import { AccountService } from './account.service'
import { AppConfigService } from '../app-config/app-config.service'

@Injectable()
export class AccountInitService {
  private readonly logger = new Logger(AccountInitService.name)
  constructor(
    @Inject(AccountService) private readonly accountService: AccountService,
    @Inject(AppConfigService)
    private readonly appConfigService: AppConfigService,
  ) {}

  async doInit() {
    if (this.appConfigService.envs.SYNC_ROOT_ACCOUNT_FLAG) {
      const result = await this.accountService.syncRootAccount()
      if (result.accExists) this.logger.log('Root账户已存在，跳过创建...')
      if (result.updated) this.logger.log('Root账户已更新')
      else this.logger.log('Root账户一致，跳过同步...')
    }
    else {
      const result = await this.accountService.checkAndCreateRootAccount()
      if (!result.exist) this.logger.log('Root账户已创建')
      else this.logger.log('Root账户已存在，跳过创建...')
    }
  }
}
