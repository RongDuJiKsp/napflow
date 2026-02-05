'use client'
import { useHealthSamplesQuery } from '@/app/hooks/query/use-health-samples-query'
import { useMemo } from 'react'
import { Gauge, Line } from '@ant-design/charts'
import { useCreation } from 'ahooks'
import { formatBytes, formatTimestamp } from './utils'
import { useScoreGaugeConfig } from './hooks/use-score-gauge'

// 内存图表组件
export const MemoryChart = () => {
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

  const config = useCreation(
    () => ({
      data: chartData,
      xField: 'time',
      yField: 'value',
      colorField: 'type',
      axis: {
        y: {
          labelFormatter: (v: number) => formatBytes(v),
        },
      },
      tooltip: {
        items: [
          {
            channel: 'y',
            valueFormatter: (v: number) => formatBytes(v),
          },
        ],
      },
      style: {
        lineWidth: 2,
      },
      height: 200,
    }),
    [chartData],
  )

  if (chartData.length === 0)
    return <div className="text-gray-400 text-center py-8">暂无内存数据</div>

  return <Line {...config} />
}

// 内存健康度仪表盘（剩余可用内存越多越健康）
export const MemoryUtilizationGauge = () => {
  const { data } = useHealthSamplesQuery()

  const memoryHealthScore = useMemo(() => {
    if (!data || data.length === 0) return 0
    const latest = data[data.length - 1]
    if (!latest?.memory) return 0
    // 剩余可用内存百分比，越高越健康
    return Math.floor(latest.memory.utilization.mean)
  }, [data])

  const config = useScoreGaugeConfig('内存健康度', memoryHealthScore)

  return <Gauge {...config} />
}
