import AppMetaProvider from '@/app/components/workflow/editor/providers/AppMetaProvider'
import type { PropsWithChildren } from 'react'

export default async function Layout({ children, params}: PropsWithChildren<{
  params: Promise<{ appId: string }>;
}>) {
  const { appId } = await params
  return (
    <AppMetaProvider appId={appId}>
      {children}
    </AppMetaProvider>
  )
}
