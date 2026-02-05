'use client'
import { useHealthSamplesQuery } from '@/app/hooks/query/use-health-samples-query'
import { useMemo } from 'react'
import { Gauge, Line } from '@ant-design/charts'
import { fmtMs, formatTimestamp } from './utils'
import { useScoreGaugeConfig } from './hooks/use-score-gauge'
import { useLineGraphConfig } from './hooks/use-line-graph'

// 事件循环图表组件
export const EventLoopChart = () => {
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

// 事件循环健康分数仪表盘
export const EventLoopHealthGauge = () => {
  const { data } = useHealthSamplesQuery()

  const healthScore = useMemo(() => {
    if (!data || data.length === 0) return 0
    const latest = data[data.length - 1]
    if (!latest?.eventLoop) return 0
    return latest.eventLoop.healthScore
  }, [data])

  const config = useScoreGaugeConfig('事件循环健康度', healthScore)

  return <Gauge {...config} />
}
