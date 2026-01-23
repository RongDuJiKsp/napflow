import { createContext, useContext } from 'react'

export type AppParam = {
  appId: string;
}

export const AppParamContext = createContext<AppParam | null>(null) // 当使用默认值时一定抛出异常

export const useAppParam = () => {
  const ctx = useContext(AppParamContext)
  if (!ctx) throw new Error('useAppParam must be used within AppParamProvider')

  return ctx
}
