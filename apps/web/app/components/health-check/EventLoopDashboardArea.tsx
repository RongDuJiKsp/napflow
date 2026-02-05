'use client'
import { useHealthSamplesQuery } from '@/app/hooks/query/use-health-samples-query'
import { memo, useMemo } from 'react'
import { Line } from '@ant-design/charts'
import { fmtMs, formatTimestamp } from './utils'
import { useLineGraphConfig } from './hooks/use-line-graph'
import { ChartCard } from './common'

// 事件循环图表组件
const EventLoopChart = () => {
  const { data } = useHealthSamplesQuery()

  const chartData = useMemo(() => {
    if (!data) return []
    return data.flatMap((item) => {
      if (!item.eventLoop) return []
      return [
        {
          time: formatTimestamp(item.timestamp),
          value: item.eventLoop.mean.mean,
          type: '平均延迟',
        },
        {
          time: formatTimestamp(item.timestamp),
          value: item.eventLoop.max.mean,
          type: '最大延迟',
        },
      ]
    })
  }, [data])

  const config = useLineGraphConfig(chartData, { fmtAxis: fmtMs, fmtTooltip: fmtMs })

  if (chartData.length === 0)
    return <div className="text-gray-400 text-center py-8">暂无事件循环数据</div>

  return <Line {...config} />
}

const EventLoopDashboardArea = () => {
  return <>
    {/* 事件循环图表 */}
    <ChartCard title="事件循环延迟趋势" >
      <EventLoopChart />
    </ChartCard>
  </>
}

export default memo(EventLoopDashboardArea)
