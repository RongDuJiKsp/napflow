import { createContext, useContext } from 'react'

export type AppMeta = {
  appId: string;
  appName?: string;
  appDesc?: string;
}

export const AppMetaContext = createContext<AppMeta>({ appId: '' })

export const useAppMeta = () => {
  const ctx = useContext(AppMetaContext)
  if(!ctx.appId)
    throw new Error('useAppMeta must be used within AppMetaProvider')

  return ctx
}
