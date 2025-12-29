'use client'
import Link from 'next/link'
import { memo } from 'react'
import { twMerge } from 'tailwind-merge'

const CreateAppCard = () => {
  return (
    <Link href="/workflows/create">
      <div className={twMerge(
        'group relative bg-linear-to-r from-purple-50 to-pink-50',
        'rounded-xl border-2 border-dashed border-pink-300 p-6 shadow-sm',
        'transition-all duration-200 hover:shadow-lg hover:border-purple-400',
        'cursor-pointer h-full flex flex-col items-center justify-center',
        'hover:from-purple-100 hover:to-pink-100',
      )}>
        {/* 加号图标 */}
        <div className="w-16 h-16 bg-linear-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4 group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-200">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>

        {/* 创建应用文字 */}
        <h3 className="text-lg font-semibold text-purple-700 mb-2">
          创建新应用
        </h3>
        <p className="text-sm text-gray-600 text-center">
          点击开始创建您的bot工作流应用
        </p>

        {/* 悬停效果 */}
        <div className="absolute inset-0 rounded-xl bg-linear-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </Link>
  )
}

export default memo(CreateAppCard)
