import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Logger } from '@nestjs/common'

export class ClientRPCError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ClientRPCError'
  }
}

export class ClientRPCFilter implements ExceptionFilter<ClientRPCError> {
  private readonly logger = new Logger(ClientRPCFilter.name)
  catch(exception: ClientRPCError, host: ArgumentsHost) {
    if(host.getType() !== 'ws') {
      this.logger.error(`ClientRPCFilter caught an exception in non-ws context: ${exception.message}`)
      return
    }
    this.logger.warn(`ClientRPCFilter caught an exception: ${exception.message}`)
  }
}
