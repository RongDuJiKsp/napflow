import BotSidebarNav from '@/app/components/bot/common-layout/BotSidebarNav'
import type { PropsWithChildren } from 'react'

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <BotSidebarNav>{children}</BotSidebarNav>
    </>
  )
}
