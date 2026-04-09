'use client'
import { useCurAccountQuery } from '@/app/hooks/query/account/use-cur-account-query'
import { dispatchLocalStorageValueSet } from '@/app/hooks/utils/use-storage'
import type { ComponentWithClass } from '@/utils/type'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  RiArrowDownSLine,
  RiBrainAi3Line,
  RiGlobalLine,
  RiLogoutBoxRLine,
  RiSettings3Line,
  RiUserSettingsLine,
} from '@remixicon/react'
import Link from 'next/link'
import { memo, useCallback } from 'react'
type LinkItem = {
  label: string;
  icon: ComponentWithClass;
  href: string;
}

const clickableLinks: LinkItem[] = [
  { label: '个人设置', icon: RiUserSettingsLine, href: '/settings/account' },
  { label: '工作区设置', icon: RiSettings3Line, href: '/settings/workspace' },
  { label: '模型设置', icon: RiBrainAi3Line, href: '/settings/models' },
  { label: '偏好设置', icon: RiGlobalLine, href: '/settings/preferences' },
]

const UserInfo = () => {
  const { data: user } = useCurAccountQuery()
  const handleLogout = useCallback(() => {
    dispatchLocalStorageValueSet('auth-token', undefined)
  }, [])

  return (
    <div>
      <Menu>
        {/* 神了 button有水合err a没有 */}
        <MenuButton as="a">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200">
            <div className="w-8 h-8 bg-linear-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.nickname?.charAt(0) || 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user?.nickname || '用户'}
            </span>
            <RiArrowDownSLine className="w-4 h-4 text-gray-500 transition-transform duration-200 active:rotate-180" />
          </div>
        </MenuButton>
        <MenuItems>
          <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100/50 z-50 overflow-hidden">
            {clickableLinks.map(item => (
              <MenuItem key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-colors duration-200"
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </MenuItem>
            ))}
            <div className="mx-3 my-1 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent"></div>
            <MenuItem>
              <div className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-linear-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-colors duration-200 cursor-pointer"
                onClick={handleLogout}>
                <RiLogoutBoxRLine className="w-4 h-4 mr-3" />
                <span className="font-medium">退出登录</span>
              </div>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>
  )
}
export default memo(UserInfo)
