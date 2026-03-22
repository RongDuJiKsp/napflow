import { Injectable, Logger } from '@nestjs/common'
@Injectable()
export class ToolCallService {
  private readonly logger = new Logger(ToolCallService.name)
}
