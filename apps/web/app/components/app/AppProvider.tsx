'use client'
import { StyleProvider } from '@ant-design/cssinjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App, ConfigProvider } from 'antd'
import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import { AntdRegistry } from '@ant-design/nextjs-registry'
const queryClient = new QueryClient()

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <StyleProvider layer>
        <ConfigProvider>
          <AntdRegistry>
            <App>{children}</App>
          </AntdRegistry>
        </ConfigProvider>
      </StyleProvider>
    </QueryClientProvider>
  )
}
export default memo(AppProvider)
