import { createContext, useContext } from 'react'

/**
 * 创建一个透传上下文
 * @param name 上下文名称
 * @returns
 *  - context: 上下文
 *  - useContextHook: 使用上下文的钩子
 */
export const createParamContext = <T>(name: string) => {
  const context = createContext<T | null>(null)
  const useContextHook = () => {
    const data = useContext(context)
    if (!data)
      throw new Error(`${name}Hook must be used within a ${name}Provider`)
    return data
  }
  return {
    context,
    useContextHook,
  }
}
