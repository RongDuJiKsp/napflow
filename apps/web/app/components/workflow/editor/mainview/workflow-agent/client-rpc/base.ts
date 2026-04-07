import type { Socket } from 'socket.io-client'
import { tryit } from 'radash'
import type { RpcPS, RpcRS, RpcRecv } from '@shared/rpc/core/ts-check'
import { ClientRpc } from '@shared/rpc/agent/client-rpc/tools'
export type Remover = () => void
type RpcAck<R> = (response: R) => void
type RpcAckFail = (errMsg?: string) => void
export type SocketRPCListener<
  A extends unknown[] = unknown[],
  ACK = unknown,
> = (ack: RpcAck<ACK>, fail: RpcAckFail, ...args: A) => Promise<void>

export class BaseClientRPCListener {
  private socket: Socket | null = null
  private readonly listeners = new Map<string, SocketRPCListener>()

  mount(socket: Socket): void {
    this.socket = socket
    socket.on('client-rpc', this.handleRPC)
  }

  unmount(): void {
    this.socket?.off('client-rpc', this.handleRPC)
    this.socket = null
  }

  listen<PS extends RpcPS = RpcPS, RS extends RpcRS = RpcRS>(
    methodName: string,
    paramSchema: PS,
    responseSchema: RS,
    handler: RpcRecv<PS, RS>,
  ): Remover {
    return this.setListener(methodName, async (ack, fail, ...requestArgs) => {
      const parsedRequest = paramSchema.safeParse(requestArgs)
      if (!parsedRequest.success) {
        console.error('[agent-client-rpc] request schema parse failed', {
          method: methodName,
          requestArgs,
          issues: parsedRequest.error.issues,
        })
        fail('request schema parse failed')
        return
      }

      const [error, response] = await tryit(handler)(...parsedRequest.data)
      if (error) {
        console.error('[agent-client-rpc] handler execution failed', {
          method: methodName,
          error,
        })
        fail('handler execution failed')
        return
      }
      const parsedResponse = responseSchema.safeParse(response)
      if (!parsedResponse.success) {
        console.error('[agent-client-rpc] response schema parse failed', {
          method: methodName,
          response,
          issues: parsedResponse.error.issues,
        })
        fail('response schema parse failed')
        return
      }
      ack(parsedResponse.data)
    })
  }

  private setListener(
    methodName: string,
    listener: SocketRPCListener,
  ): Remover {
    this.listeners.set(methodName, listener)
    return () => {
      this.listeners.delete(methodName)
    }
  }

  private handleRPC = async (
    methodName: string,
    ...argsWithAck: [...unknown[], RpcAck<unknown>]
  ): Promise<void> => {
    const requestArgs = argsWithAck.slice(0, -1)
    const ack: RpcAck<unknown> = argsWithAck[
      argsWithAck.length - 1
    ] as RpcAck<unknown>
    const fail: RpcAckFail = (errMsg?: string) => ack(ClientRpc.fail(errMsg))

    const listener = this.listeners.get(methodName)
    if (!listener) {
      console.error('[agent-client-rpc] method listener not found', {
        method: methodName,
      })
      fail('method listener not found')
      return
    }
    await listener(ack, fail, ...requestArgs)
  }
}
