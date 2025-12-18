import { AppParamContext } from '@/app/components/workflow/hooks/use-app-param'
import type { PropsWithChildren } from 'react'

export default async function Layout({ children, params}: PropsWithChildren<{
  params: Promise<{ appId: string }>;
}>) {
  const param = await params
  return (
    <AppParamContext.Provider value={param}>
      {children}
    </AppParamContext.Provider>
  )
}
