'use client'
import { App } from 'antd'
import type { PropsWithChildren } from 'react'
import { memo } from 'react'

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <App>{children}</App>
  )
}
export default memo(AppProvider)
