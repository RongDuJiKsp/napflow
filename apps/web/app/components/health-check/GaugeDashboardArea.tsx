import { useHealthSamplesQuery } from '@/app/hooks/query/use-health-samples-query'
import { Gauge } from '@ant-design/charts'
import { memo, useMemo } from 'react'
import { useScoreGaugeConfig } from './hooks/use-score-gauge'
import { ChartCard } from './common'

// GC 健康分数仪表盘
const GCHealthGauge = () => {
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

export const MemoryUtilizationGauge = () => {
  const { data } = useHealthSamplesQuery()

  const memoryHealthScore = useMemo(() => {
    if (!data || data.length === 0) return 0
    const latest = data[data.length - 1]
    if (!latest?.memory) return 0
    return Math.floor(latest.memory.utilization.mean)
  }, [data])

  const config = useScoreGaugeConfig('内存健康度', memoryHealthScore)

  return <Gauge {...config} />
}

const GaugeDashboardArea = () => {
  return (
    <>
      <ChartCard title="内存健康度">
        <MemoryUtilizationGauge />
      </ChartCard>
      <ChartCard title="事件循环健康度">
        <EventLoopHealthGauge />
      </ChartCard>
      <ChartCard title="GC 健康度">
        <GCHealthGauge />
      </ChartCard>
    </>
  )
}

export default memo(GaugeDashboardArea)
