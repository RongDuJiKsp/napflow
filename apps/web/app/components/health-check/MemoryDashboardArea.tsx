'use client'
import { useHealthSamplesQuery } from '@/app/hooks/query/use-health-samples-query'
import { memo, useMemo } from 'react'
import { Line } from '@ant-design/charts'
import { formatBytes, formatTimestamp } from './utils'
import { useLineGraphConfig } from './hooks/use-line-graph'
import { ChartCard } from './common'

// 内存图表组件
const MemoryChart = () => {
  const { data } = useHealthSamplesQuery()

  const chartData = useMemo(() => {
    if (!data) return []
    return data.flatMap((item) => {
      if (!item.memory) return []
      return [
        {
          time: formatTimestamp(item.timestamp),
          value: item.memory.heapUsed.mean,
          type: '堆内存使用',
        },
        {
          time: formatTimestamp(item.timestamp),
          value: item.memory.heapTotal.mean,
          type: '堆内存总量',
        },
        {
          time: formatTimestamp(item.timestamp),
          value: item.memory.rss.mean,
          type: 'RSS',
        },
      ]
    })
  }, [data])

  const config = useLineGraphConfig(chartData, { fmtAxis: formatBytes, fmtTooltip: formatBytes })

  if (chartData.length === 0)
    return <div className="text-gray-400 text-center py-8">暂无内存数据</div>

  return <Line {...config} />
}

const MemoryDashboardArea = () => {
  return (
    <>
      <ChartCard title="内存使用趋势" >
        <MemoryChart />
      </ChartCard>
    </>
  )
}

export default memo(MemoryDashboardArea)
