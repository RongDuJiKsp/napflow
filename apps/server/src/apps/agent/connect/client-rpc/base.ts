import { PluginService } from '@/src/utils/traits'
import type { Socket } from 'socket.io'
import z from 'zod'
import { ClientRPCError } from '../middleware/client-rpc.filter'
import type { RpcPS, RpcRS } from '@shared/rpc/core/ts-check'
import { Logger } from '@nestjs/common'

export class BaseClientRPCRequester extends PluginService<[Socket]> {
  private readonly logger = new Logger(BaseClientRPCRequester.name)
  private socket: Socket | null = null

  mount(socket: Socket): void {
    this.socket = socket
  }

  unmount(): void {
    this.socket = null
  }

  async emit<A extends any[], R>(...args: A): Promise<R> {
    this.logger.debug('Emitting client RPC request', { args })
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new ClientRPCError('Socket is not connected'))
        return
      }
      this.socket.emit('client-rpc', ...args, (response: R) => {
        this.logger.debug('Received client RPC response', { response })
        resolve(response)
      })
    })
  }

  async emitWithSchema<
    PS extends RpcPS = RpcPS,
    RS extends RpcRS = RpcRS,
  >(
    paramSchema: PS,
    responseSchema: RS,
    method: string,
    ...args: z.input<PS>
  ): Promise<z.output<RS>> {
    const parseResult = paramSchema.safeParse(args)
    if (!parseResult.success) {
      throw new ClientRPCError(
        `Invalid arguments: ${z.prettifyError(parseResult.error)}`,
      )
    }

    const response = await this.emit(method, ...parseResult.data)
    const resp = responseSchema.safeParse(response)
    if (!resp.success) {
      throw new ClientRPCError(
        `Invalid response: ${z.prettifyError(resp.error)}`,
      )
    }

    return resp.data
  }
}
