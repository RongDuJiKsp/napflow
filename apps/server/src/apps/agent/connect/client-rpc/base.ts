import { PluginService } from '@/src/utils/traits'
import type { Socket } from 'socket.io'
import z from 'zod'
import { ClientRPCError } from '../middleware/client-rpc.filter'

export class BaseClientRPCRequester extends PluginService<[Socket]> {
  private socket: Socket | null = null

  mount(socket: Socket): void {
    this.socket = socket
  }

  unmount(): void {
    this.socket = null
  }

  async emit<A extends any[], R>(...args: A): Promise<R> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new ClientRPCError('Socket is not connected'))
        return
      }
      this.socket.emit('client-rpc', ...args, (response: R) => {
        resolve(response)
      })
    })
  }

  async emitWithSchema<
    PS extends z.ZodTuple<any, any>,
    RS extends z.ZodTypeAny,
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
