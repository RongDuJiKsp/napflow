'use client'
import { RiDashboard2Line } from '@remixicon/react'
import { useCreation } from 'ahooks'
import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import Sider from 'antd/es/layout/Sider'
import type { PropsWithChildren } from 'react'
import { memo, useState } from 'react'

const BotSidebarLayout = ({ children }: PropsWithChildren) => {
  const [collapsed, setCollapsed] = useState(false)
  const menuItems = useCreation<Required<MenuProps>['items']>(() => [
    {
      key: 'dashboard',
      icon: <RiDashboard2Line size={16}/>,
      label: '状态面板',
    },
  ], [])
  return (
    <div className="w-full h-main flex flex-row">
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme='light'>
        <Menu items={menuItems} mode='inline' />
      </Sider>
      {children}
    </div>
  )
}

export default memo(BotSidebarLayout)
