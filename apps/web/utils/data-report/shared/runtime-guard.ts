const createRuntimeError = (scope: string, expectedRuntime: string) => {
  return new Error(
    `[data-report] ${scope} 仅支持 ${expectedRuntime} 运行时调用。`,
  )
}

export const ClientOnly = (scope?: string) => {
  return (
    _target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const runtimeScope = scope ?? String(propertyKey)

    if (typeof descriptor.value === 'function') {
      const originalMethod = descriptor.value

      descriptor.value = function (...args: unknown[]) {
        if (typeof window === 'undefined')
          throw createRuntimeError(runtimeScope, '浏览器')

        return originalMethod.apply(this, args)
      }

      return descriptor
    }

    if (typeof descriptor.get === 'function') {
      const originalGetter = descriptor.get

      descriptor.get = function () {
        if (typeof window === 'undefined')
          throw createRuntimeError(runtimeScope, '浏览器')

        return originalGetter.call(this)
      }

      return descriptor
    }

    throw new Error('[data-report] Runtime 装饰器仅支持方法或 getter')
  }
}

export const ServerOnly = (scope?: string) => {
  return (
    _target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const runtimeScope = scope ?? String(propertyKey)

    if (typeof descriptor.value === 'function') {
      const originalMethod = descriptor.value

      descriptor.value = function (...args: unknown[]) {
        if (typeof window !== 'undefined')
          throw createRuntimeError(runtimeScope, '服务端')

        return originalMethod.apply(this, args)
      }

      return descriptor
    }

    if (typeof descriptor.get === 'function') {
      const originalGetter = descriptor.get

      descriptor.get = function () {
        if (typeof window !== 'undefined')
          throw createRuntimeError(runtimeScope, '服务端')

        return originalGetter.call(this)
      }

      return descriptor
    }

    throw new Error('[data-report] Runtime 装饰器仅支持方法或 getter')
  }
}
