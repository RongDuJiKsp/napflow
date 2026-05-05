import { Worker, WorkerMethod } from 'nestjs-worker'
import { VM } from 'vm2'
@Worker({
  name: 'CoreRuntimeWorker',
})
export class CoreRuntimeWorker {
  @WorkerMethod({
    timeout: 8000,
    retries: 2,
    priority: 'high',
  })
  async execFunctionCodeWithArgs<Args extends any[], Ret>(
    execFuncName: string,
    declareCode: string,
    args: Args,
  ): Promise<Ret> {
    const codeToExec = `
        ${declareCode}
        ${execFuncName}(...dynamicArgs)
      `
    return new VM({
      timeout: 6000,
      sandbox: {
        dynamicArgs: args,
      },
      allowAsync: false,
    }).run(codeToExec)
  }
}
