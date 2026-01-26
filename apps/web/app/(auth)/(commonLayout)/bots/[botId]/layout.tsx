import BotProvider from '@/app/components/bot/provider/BotProvider'
import type { PropsWithChildren } from 'react'

export default async function Layout({ children, params }: PropsWithChildren<{ params: Promise<{ botId: string }> }>) {
  const param = await params
  return (
    <>
      <BotProvider routerParam={param}>
        {children}
      </BotProvider>
    </>
  )
}
