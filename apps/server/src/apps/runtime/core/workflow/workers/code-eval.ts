import { VM } from 'vm2'

export type CodeEvalWorkerParams = {
  declareCode: string,
  execFuncName: string,
  dynamicArgs: any[]
}
export default ({ declareCode, execFuncName, dynamicArgs }: CodeEvalWorkerParams) => {
  const codeToExec = `
            ${declareCode}
            ${execFuncName}(...dynamicArgs)
          `
  return JSON.stringify(
    new VM({
      timeout: 6000,
      sandbox: {
        dynamicArgs,
      },
      allowAsync: false,
    }).run(codeToExec),
  )
}
