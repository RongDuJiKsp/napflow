import type { Socket } from 'socket.io-client'
import type z from 'zod'
import { tryit } from 'radash'

export type Remover = () => void
type RpcAck<R> = (response: R) => void
export type SchemaHandler<
  PS extends z.ZodTuple = z.ZodTuple,
  RS extends z.ZodTypeAny = z.ZodTypeAny,
> = (
  ...args: z.output<PS>
) => Promise<z.input<RS>> | z.input<RS>
export type SocketRPCListener<A extends unknown[] = unknown[], ACK = unknown> = (...args: [...A, RpcAck<ACK>]) => Promise<void>

export class BaseClientRPCListener {
  private socket: Socket | null = null
  private readonly listeners = new Map<string, Set<SocketRPCListener>>()

  mount(socket: Socket): void {
    this.socket = socket
    socket.on('client-rpc', this.handleRPC)
  }

  unmount(): void {
    this.socket?.off('client-rpc', this.handleRPC)
    this.socket = null
  }

  listen<
    PS extends z.ZodTuple = z.ZodTuple,
    RS extends z.ZodTypeAny = z.ZodTypeAny,
  >(
    methodName: string,
    paramSchema: PS,
    responseSchema: RS,
    handler: SchemaHandler<PS, RS>,
  ): Remover {
    return this.addListener(methodName, async (...argsWithAck) => {
      const ack = argsWithAck[argsWithAck.length - 1] as RpcAck<unknown>
      const requestArgs = argsWithAck.slice(0, -1) as unknown[]

      const parsedRequest = paramSchema.safeParse(requestArgs)
      if (!parsedRequest.success) {
        console.error('[agent-client-rpc] request schema parse failed', {
          method: methodName,
          requestArgs,
          issues: parsedRequest.error.issues,
        })
        ack({ success: false })
        return
      }

      const [error, response] = await tryit(handler)(...parsedRequest.data)
      if(error) {
        console.error('[agent-client-rpc] handler execution failed', {
          method: methodName,
          error,
        })
        ack({ success: false })
        return
      }
      const parsedResponse = responseSchema.safeParse(response)
      if (!parsedResponse.success) {
        console.error('[agent-client-rpc] response schema parse failed', {
          method: methodName,
          response,
          issues: parsedResponse.error.issues,
        })
        ack({ success: false })
        return
      }
      ack(parsedResponse.data)
    })
  }

  private addListener(methodName: string, listener: SocketRPCListener): Remover {
    const existingListeners = this.listeners.get(methodName) || new Set()
    existingListeners.add(listener)
    this.listeners.set(methodName, existingListeners)
    return () => {
      this.listeners.get(methodName)?.delete(listener)
    }
  }

  private handleRPC = async (
    methodName: string,
    ...argsWithAck: [...unknown[], RpcAck<unknown>]
  ): Promise<void> => {
    const listener = this.listeners.get(methodName)
    if (!listener) {
      console.error('[agent-client-rpc] method listener not found', {
        method: methodName,
      })
      return
    }
    await Promise.all([...listener.values()].map(l => l(...argsWithAck)))
  }
}
