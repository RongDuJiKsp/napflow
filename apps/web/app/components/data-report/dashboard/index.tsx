'use client'

import { memo } from 'react'
import { useDataReportDashboardQuery } from '@/app/hooks/query/data-report/use-data-report-dashboard-query'
import DetailTableArea from './DetailTableArea'
import OverviewArea from './OverviewArea'
import TrendArea from './TrendArea'
import { EmptyState, LoadingState } from './common'
import { formatDateTime } from './utils'

const DataReportDashboard = () => {
  const { data, isLoading, isFetching, error, refetch }
    = useDataReportDashboardQuery()

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-800">异常上报面板</h2>
        <LoadingState />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">异常上报面板</h2>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : '拉取面板数据失败'}
        </div>
      </div>
    )
  }

  let content = <EmptyState />
  if (data.total > 0) {
    content = (
      <>
        <OverviewArea bySource={data.bySource} total={data.total} />
        <TrendArea trend={data.trend} />
        <DetailTableArea items={data.items} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-emerald-50/30 to-cyan-50/40 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-emerald-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                Data Report Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                最近 {data.windowMinutes} 分钟前端未捕获异常
              </p>
              <p className="mt-1 text-xs text-slate-500">
                最后刷新: {formatDateTime(data.nowMs)}
              </p>
            </div>
            <button
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-100"
              onClick={() => {
                refetch().catch(() => undefined)
              }}
              type="button"
            >
              {isFetching ? '刷新中...' : '手动刷新'}
            </button>
          </div>
        </header>

        {content}
      </div>
    </div>
  )
}

export default memo(DataReportDashboard)
