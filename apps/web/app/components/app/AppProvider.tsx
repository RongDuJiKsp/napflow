'use client'
import { StyleProvider } from '@ant-design/cssinjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App, ConfigProvider } from 'antd'
import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { AntDesignTheme } from '@/app/style/ant-design-theme'
import { useCreation } from 'ahooks'
import InternErrorCaptureBootstrap from './InternErrorCaptureBootstrap'

const AppProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useCreation(() => new QueryClient(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <StyleProvider layer>
        <ConfigProvider theme={AntDesignTheme}>
          <AntdRegistry>
            <App>
              <InternErrorCaptureBootstrap>
                {children}
              </InternErrorCaptureBootstrap>
            </App>
          </AntdRegistry>
        </ConfigProvider>
      </StyleProvider>
    </QueryClientProvider>
  )
}
export default memo(AppProvider)
