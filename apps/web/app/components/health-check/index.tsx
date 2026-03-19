'use client'
import { useHealthSamplesQuery } from '@/app/hooks/query/health/use-health-samples-query'
import { memo } from 'react'
import { formatTimestamp } from './utils'
import { EmptyState, LoadingState } from './common'
import CpuDashboardArea from './CpuDashboardArea'
import MemoryDashboardArea from './MemoryDashboardArea'
import EventLoopDashboardArea from './EventLoopDashboardArea'
import GaugeDashboardArea from './GaugeDashboardArea'
import GcDashboardArea from './GcDashboardArea'

const HealthCheckDashboard = () => {
  const { data, isLoading } = useHealthSamplesQuery()

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">系统健康监控</h2>
        <LoadingState />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">系统健康监控</h2>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">系统健康监控</h2>
        <span className="text-sm text-gray-500">
          最后更新: {formatTimestamp(data[data.length - 1].sampleAtMs)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GaugeDashboardArea />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CpuDashboardArea />
        <EventLoopDashboardArea />
        <MemoryDashboardArea />
        <GcDashboardArea />
      </div>
    </div>
  )
}

export default memo(HealthCheckDashboard)
