'use client'
import { useHealthSamplesQuery } from '@/app/hooks/query/use-health-samples-query'
import { useMemo } from 'react'
import { Gauge, Line } from '@ant-design/charts'
import { StatCard } from './common'
import { useScoreGaugeConfig } from './hooks/use-score-gauge'
import { useLineGraphConfig } from './hooks/use-line-graph'
import { fmtMs, formatTimestamp } from './utils'

// GC 健康分数仪表盘
export const GCHealthGauge = () => {
  const { data } = useHealthSamplesQuery()

  const healthScore = useMemo(() => {
    if (!data || data.length === 0) return 0
    const latest = data[data.length - 1]
    if (!latest?.gc) return 0
    // score 值域 0-100，100 为最好，0 为最差
    return Math.min(Math.max(latest.gc.pressureScore, 0), 100)
  }, [data])

  const config = useScoreGaugeConfig('GC 健康度', healthScore)

  return <Gauge {...config} />
}

// GC 统计信息
export const GCStats = () => {
  const { data } = useHealthSamplesQuery()

  const gcStats = useMemo(() => {
    if (!data || data.length === 0) return null
    const latest = data[data.length - 1]
    if (!latest?.gc) return null
    return {
      frequency: latest.gc.frequency,
      avgDuration: latest.gc.duration?.mean ?? 0,
      // score 值域 0-100，100 为最好
      healthScore: latest.gc.pressureScore,
    }
  }, [data])

  if (!gcStats)
    return <div className="text-gray-400 text-center py-8">暂无 GC 数据</div>

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard title="GC 频率" value={gcStats.frequency.toFixed(2)} unit="次/秒" />
      <StatCard title="平均耗时" value={gcStats.avgDuration.toFixed(2)} unit="ms" />
      <StatCard
        title="健康分数"
        value={gcStats.healthScore.toFixed(1)}
        unit="分"
        description={gcStats.healthScore >= 70 ? '健康' : gcStats.healthScore >= 30 ? '一般' : '较差'}
      />
    </div>
  )
}

// GC 次数趋势图
export const GCFrequencyChart = () => {
  const { data } = useHealthSamplesQuery()

  const chartData = useMemo(() => {
    if (!data) return []
    return data.flatMap((item) => {
      if (!item.gc) return []
      return [
        {
          time: formatTimestamp(item.timestamp),
          value: item.gc.frequency,
          type: 'GC 次数',
        },
      ]
    })
  }, [data])

  const config = useLineGraphConfig(chartData, {
    fmtAxis: (val: number) => `${val.toFixed(2)}`,
    fmtTooltip: (val: number) => `${val.toFixed(2)} 次/秒`,
  })

  if (chartData.length === 0)
    return <div className="text-gray-400 text-center py-8">暂无 GC 数据</div>

  return <Line {...config} />
}

// GC 时延趋势图
export const GCDurationChart = () => {
  const { data } = useHealthSamplesQuery()

  const chartData = useMemo(() => {
    if (!data) return []
    return data.flatMap((item) => {
      if (!item.gc) return []
      return [
        {
          time: formatTimestamp(item.timestamp),
          value: item.gc.duration?.mean ?? 0,
          type: 'GC 时延',
        },
      ]
    })
  }, [data])

  const config = useLineGraphConfig(chartData, { fmtAxis: fmtMs, fmtTooltip: fmtMs })

  if (chartData.length === 0)
    return <div className="text-gray-400 text-center py-8">暂无 GC 数据</div>

  return <Line {...config} />
}
