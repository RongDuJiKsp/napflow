'use client'
import { RiDashboard2Line, RiWebhookLine } from '@remixicon/react'
import { useCreation } from 'ahooks'
import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import Sider from 'antd/es/layout/Sider'
import { usePathname, useRouter } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { memo, useCallback, useMemo, useState } from 'react'

const BotSidebarLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const menuItems = useCreation<Required<MenuProps>['items']>(() => [
    {
      key: 'dashboard',
      icon: <RiDashboard2Line size={16}/>,
      label: '状态面板',
    },
    {
      key: 'binding',
      icon: <RiWebhookLine size={16}/>,
      label: '绑定工作流',
    },
  ], [])

  const currKey = pathname.split('/')[3]
  const selectKeys = useMemo(() => [currKey], [currKey])
  const handleClick = useCallback<Required<MenuProps>['onClick']>(({ key }) => {
    router.push([...pathname.split('/').slice(0, 3), key].join('/'))
  }, [router, pathname])

  return (
    <div className="w-full h-main flex flex-row">
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme='light'>
        <Menu items={menuItems} mode='inline' selectedKeys={selectKeys} onClick={handleClick}/>
      </Sider>
      {children}
    </div>
  )
}

export default memo(BotSidebarLayout)
