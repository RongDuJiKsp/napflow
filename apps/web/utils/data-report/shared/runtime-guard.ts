type RuntimeKind = 'client' | 'server'

const createRuntimeError = (scope: string, expectedRuntime: string) => {
  return new Error(
    `[data-report] ${scope} 仅支持 ${expectedRuntime} 运行时调用。`,
  )
}

const ensureRuntime = (scope: string, kind: RuntimeKind) => {
  if (kind === 'client' && typeof window === 'undefined')
    throw createRuntimeError(scope, '浏览器')

  if (kind === 'server' && typeof window !== 'undefined')
    throw createRuntimeError(scope, '服务端')
}

const createRuntimeDecorator = (kind: RuntimeKind, scope?: string) => {
  return (
    _target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const runtimeScope = scope ?? String(propertyKey)

    if (typeof descriptor.value === 'function') {
      const originalMethod = descriptor.value

      descriptor.value = function (...args: unknown[]) {
        ensureRuntime(runtimeScope, kind)
        return originalMethod.apply(this, args)
      }

      return descriptor
    }

    if (typeof descriptor.get === 'function') {
      const originalGetter = descriptor.get

      descriptor.get = function () {
        ensureRuntime(runtimeScope, kind)
        return originalGetter.call(this)
      }

      return descriptor
    }

    throw new Error('[data-report] Runtime 装饰器仅支持方法或 getter')
  }
}

export const ClientOnly = (scope?: string) => {
  return createRuntimeDecorator('client', scope)
}

export const ServerOnly = (scope?: string) => {
  return createRuntimeDecorator('server', scope)
}
