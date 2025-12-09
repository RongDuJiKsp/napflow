'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from 'antd'
import type { PropsWithChildren } from 'react'
import { memo } from 'react'
const queryClient = new QueryClient()

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <App>
        {children}
      </App>
    </QueryClientProvider>
  )
}
export default memo(AppProvider)
