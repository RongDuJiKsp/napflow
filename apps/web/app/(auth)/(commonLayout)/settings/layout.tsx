'use client'

import { RiGlobalLine, RiTeamLine, RiUserSettingsLine } from '@remixicon/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigationItems = [
    { href: '/settings/account', icon: RiUserSettingsLine, label: '账户设置' },
    { href: '/settings/workspace', icon: RiTeamLine, label: '工作区设置' },
    { href: '/settings/preferences', icon: RiGlobalLine, label: '偏好设置' },
  ]

  return (
    <div className="bg-linear-to-br from-pink-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex">
            {/* 左侧导航栏 */}
            <div className="w-64 bg-linear-to-b from-purple-50 to-pink-50 border-r border-purple-100">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-purple-700 mb-8">设置</h1>
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={twMerge('flex items-center px-4 py-3 rounded-lg transition-all duration-200',
                          isActive && 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-md',
                          !isActive && 'text-purple-700 hover:bg-purple-50 hover:text-purple-600',
                        )}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* 右侧内容区域 */}
            <div className="flex-1 p-8 h-[85vh] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
