'use client'
import type { ComponentWithClass } from '@/utils/type'
import { RiBtcLine } from '@remixicon/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo } from 'react'
import { twMerge } from 'tailwind-merge'

type NavigationItem = {
  href: string;
  icon: ComponentWithClass;
  label: string;
}

const navigationItems: NavigationItem[] = [
  { href: '/bots', icon: RiBtcLine, label: '机器人' },
  { href: '/analytics', icon: RiBtcLine, label: '分析' },
]

const HeaderNavigation = () => {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  return (
    <nav className="hidden md:block ml-10">
      <div className="flex items-baseline space-x-4">
        {navigationItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={twMerge(
              'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(item.href)
                && 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-md',
              !isActive(item.href)
                && 'text-purple-700 hover:bg-purple-50 hover:text-purple-600',
            )}
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default memo(HeaderNavigation)
