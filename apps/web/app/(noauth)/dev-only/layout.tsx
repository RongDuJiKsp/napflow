import { isDevelopment } from '@/config/env'
import { redirect } from 'next/navigation'
import type { PropsWithChildren } from 'react'

export default function Layout({ children }: PropsWithChildren) {
  if (!isDevelopment) redirect('/')

  return <>{children}</>
}
