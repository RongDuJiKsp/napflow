'use client'

import UserInfo from '@/app/components/common-layout/UserInfo'
import HeaderNavigation from '@/app/components/common-layout/HeaderNavigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-linear-to-br from-pink-50/30 to-purple-50/30">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-md border-b border-purple-100 h-headerbar">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 左侧Logo和导航 */}
            <div className="flex items-center">
              <div className="shrink-0">
                <h1 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  NapFlow
                </h1>
              </div>
              <HeaderNavigation/>
            </div>
            {/* 右侧用户信息和个人中心 */}
            <UserInfo/>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className='overflow-y-auto h-main'>
        {children}
      </main>
    </div>
  )
}
