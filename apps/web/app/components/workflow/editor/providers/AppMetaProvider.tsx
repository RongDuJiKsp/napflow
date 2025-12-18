'use client'
import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import { AppMetaContext } from './hooks/use-app-meta'

const AppMetaProvider = ({ appId, children }: PropsWithChildren<{ appId: string, }>) => {
  return (
    <AppMetaContext.Provider value={{ appId }}>
      {children}
    </AppMetaContext.Provider>
  )
}

export default memo(AppMetaProvider)
