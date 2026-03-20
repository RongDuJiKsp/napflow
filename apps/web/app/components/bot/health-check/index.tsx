'use client'

import { memo } from 'react'
import { useBotHealthCheckQuery } from '@/app/hooks/query/bot/health-check/use-bot-health-check-query'
import { useBotParam } from '../hooks/use-bot-param'
import { formatTimestamp } from '../../health-check/utils'
import { EmptyState, LoadingState } from '../../health-check/common'
import NodeQueueArea from './NodeQueueArea'
import TaskQueueArea from './TaskQueueArea'
import BotOperatePanel from './BotOperatePanel'
import { useHealthCheck } from './hooks/use-health-check'

const BotHealthCheck = () => {
  const { botId } = useBotParam()
  const { data, isLoading } = useBotHealthCheckQuery(botId)
  useHealthCheck()

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Bot健康监控</h2>
        <LoadingState />
        <BotOperatePanel />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Bot健康监控</h2>
        <EmptyState />
        <BotOperatePanel />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Bot健康监控</h2>
        <span className="text-sm text-gray-500">
          最后更新: {formatTimestamp(data[data.length - 1].sampleAtMs)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NodeQueueArea />
        <TaskQueueArea />
      </div>

      <BotOperatePanel />
    </div>
  )
}

export default memo(BotHealthCheck)
