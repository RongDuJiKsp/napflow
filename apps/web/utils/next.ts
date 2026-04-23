const isBrowser = () => typeof window !== 'undefined'

export enum ExecutionEnvironment {
  Browser = 'browser',
  Native = 'native',
}

export const currentRuntime = () =>
  isBrowser() ? ExecutionEnvironment.Browser : ExecutionEnvironment.Native

export const LimitExecEnvClass = (
  env: ExecutionEnvironment,
  scope?: string,
) => {
  return function <C extends new (...args: any[]) => any>(Base: C): C {
    const scopeWithClassFallback = scope ?? `[Class ${Base.name}]`
    return class extends Base {
      constructor(...args: any[]) {
        if (env !== currentRuntime()) {
          throw new Error(
            `[data-report] ${scopeWithClassFallback} 仅支持 ${env} 运行时调用。`,
          )
        }
        super(...args)
      }
    } as C
  }
}

export const LimitExecEnvMethod = (
  env: ExecutionEnvironment,
  scope?: string,
) => {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const targetClassName
      = typeof target === 'function' ? target.name : target.constructor.name
    const original = descriptor.value
    descriptor.value = function (...args: unknown[]) {
      const currentEnv = currentRuntime()
      if (currentEnv !== env) {
        const scopeWithMethodFallback
          = scope ?? `[Method ${targetClassName}.${propertyKey}]`
        throw new Error(
          `Method ${scopeWithMethodFallback} cannot run in ${currentEnv}, expected ${env}`,
        )
      }
      return original.apply(this, args)
    }
    return descriptor
  }
}
