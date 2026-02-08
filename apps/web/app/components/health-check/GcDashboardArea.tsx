'use client'
import { useHealthSamplesQuery } from '@/app/hooks/query/use-health-samples-query'
import { memo, useMemo } from 'react'
import { Line } from '@ant-design/charts'
import { ChartCard, StatCard } from './common'
import { useLineGraphConfig } from '../../hooks/antd-charts/use-line-graph'
import { fmtGCAxis, fmtGCTooltip, fmtMsAxis, fmtMsTooltip, formatTimestamp } from './utils'
const getGcScoreDescription = (score: number) => {
  if (score >= 70) return '健康'
  if (score >= 30) return '一般'
  return '较差'
}

// GC 统计信息
const GCStats = () => {
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
      <StatCard title="GC 频率" value={gcStats.frequency.toFixed(2)} unit="次/分钟" />
      <StatCard title="平均耗时" value={gcStats.avgDuration.toFixed(2)} unit="ms" />
      <StatCard
        title="健康分数"
        value={gcStats.healthScore.toFixed(1)}
        unit="分"
        description={getGcScoreDescription(gcStats.healthScore)}
      />
    </div>
  )
}

// GC 次数趋势图
const GCFrequencyChart = () => {
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
    fmtAxis: fmtGCAxis,
    fmtTooltip: fmtGCTooltip,
  })

  if (chartData.length === 0)
    return <div className="text-gray-400 text-center py-8">暂无 GC 数据</div>

  return <Line {...config} />
}

// GC 时延趋势图
const GCDurationChart = () => {
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
        {
          time: formatTimestamp(item.timestamp),
          value: item.gc.duration?.p95 ?? 0,
          type: 'GC 时延 P95',
        },
      ]
    })
  }, [data])

  const config = useLineGraphConfig(chartData, { fmtAxis: fmtMsAxis, fmtTooltip: fmtMsTooltip })

  if (chartData.length === 0)
    return <div className="text-gray-400 text-center py-8">暂无 GC 数据</div>

  return <Line {...config} />
}

const GcDashboardArea = () => {
  return <>
    {/* GC 统计信息 */}
    <ChartCard title="GC 统计信息" >
      <GCStats />
    </ChartCard>

    {/* GC 趋势图 */}
    <ChartCard title="GC 次数趋势" >
      <GCFrequencyChart />
    </ChartCard>
    <ChartCard title="GC 时延趋势" >
      <GCDurationChart />
    </ChartCard>
  </>
}

export default memo(GcDashboardArea)
