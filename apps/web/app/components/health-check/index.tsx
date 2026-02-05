'use client'
import { useHealthSamplesQuery } from '@/app/hooks/query/use-health-samples-query'
import { memo } from 'react'
import { formatTimestamp } from './utils'
import { ChartCard, EmptyState, LoadingState } from './common'
import { CPUChart } from './cpu-chart'
import { MemoryChart, MemoryUtilizationGauge } from './memory-chart'
import { EventLoopChart, EventLoopHealthGauge } from './event-loop-chart'
import { GCHealthGauge, GCStats } from './gc-chart'

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
          最后更新: {formatTimestamp(data[data.length - 1].timestamp)}
        </span>
      </div>

      {/* 仪表盘区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="内存健康度">
          <MemoryUtilizationGauge />
        </ChartCard>
        <ChartCard title="事件循环健康度">
          <EventLoopHealthGauge />
        </ChartCard>
        <ChartCard title="GC 健康度">
          <GCHealthGauge />
        </ChartCard>
      </div>

      {/* 趋势图区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="CPU 使用趋势">
          <CPUChart />
        </ChartCard>
        <ChartCard title="内存使用趋势">
          <MemoryChart />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="事件循环延迟趋势">
          <EventLoopChart />
        </ChartCard>
        <ChartCard title="GC 统计信息">
          <GCStats />
        </ChartCard>
      </div>
    </div>
  )
}

export default memo(HealthCheckDashboard)
