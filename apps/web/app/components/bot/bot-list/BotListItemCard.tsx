'use client'
import type { CommonBotInfo } from '@shared/common/bot/base'
import { BotRunningState } from '@shared/common/bot/base'
import { memo, useCallback } from 'react'
import { twMerge } from 'tailwind-merge'

const getStatusColor = (state: BotRunningState) => {
  switch (state) {
    case BotRunningState.running:
      return 'bg-linear-to-r from-blue-500 to-indigo-500'
    case BotRunningState.stopped:
      return 'bg-gray-400'
    case BotRunningState.offline:
      return 'bg-linear-to-r from-amber-500 to-orange-500'
    case BotRunningState.fatal:
      return 'bg-linear-to-r from-red-500 to-pink-500'
    case BotRunningState.killed:
      return 'bg-gray-600'
    default:
      return 'bg-gray-400'
  }
}

const getStatusText = (state: BotRunningState) => {
  switch (state) {
    case BotRunningState.running:
      return '运行中'
    case BotRunningState.stopped:
      return '已停止'
    case BotRunningState.offline:
      return '离线'
    case BotRunningState.fatal:
      return '错误'
    case BotRunningState.killed:
      return '已终止'
    default:
      return '未知'
  }
}

const formatDate = (date?: Date) => {
  if (!date) return '未启动'
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const BotListItemCard = ({ item }: { item: CommonBotInfo }) => {
  const handleClick = useCallback(() => {
    // 处理点击事件，可以跳转到bot详情页
    console.log('Bot clicked:', item.botId)
  }, [item.botId])

  return (
    <div
      onClick={handleClick}
      className="group bg-linear-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200 p-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-purple-300 cursor-pointer"
    >
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={twMerge(
            'w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold',
            getStatusColor(item.state.runningState),
          )}>
            <span className="text-sm">
              {item.adapterDesc.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <h3 className="text-base font-semibold text-purple-700 line-clamp-1">
              {item.botDesc || '未命名Bot'}
            </h3>
            <p className="text-xs text-gray-500">ID: {item.botId.slice(0, 8)}...</p>
          </div>
        </div>

        {/* 状态标签 */}
        <div className={twMerge(
          'px-2 py-1 rounded-full text-xs font-medium text-white',
          getStatusColor(item.state.runningState),
        )}>
          {getStatusText(item.state.runningState)}
        </div>
      </div>

      {/* 详细信息 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">适配器</span>
          <span className="text-gray-900 font-medium">{item.adapterDesc}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">启动时间</span>
          <span className="text-gray-900 font-medium">{formatDate(item.state.bootTime)}</span>
        </div>

        {item.state.lastExitCode !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">退出码</span>
            <span className="text-gray-900 font-medium">{item.state.lastExitCode}</span>
          </div>
        )}
      </div>

      {/* 悬停效果 */}
      <div className="absolute inset-0 rounded-xl bg-linear-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
  )
}

export default memo(BotListItemCard)
