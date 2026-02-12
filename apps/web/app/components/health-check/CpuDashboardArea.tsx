'use client'
import { useHealthSamplesQuery } from '@/app/hooks/query/use-health-samples-query'
import { memo, useMemo } from 'react'
import { Line } from '@ant-design/charts'
import { formatTimestamp } from './utils'
import { useLineGraphConfig } from '../../hooks/antd-charts/use-line-graph'
import { fmtPersentAxis, fmtPersentTooltip } from './utils'
import { ChartCard } from './common'
// CPU 图表组件
const CPUChart = () => {
  const { data } = useHealthSamplesQuery()

  const chartData = useMemo(() => {
    if (!data) return []
    return data.flatMap((item) => {
      if (!item.cpu) return []
      return [
        {
          time: formatTimestamp(item.sampleAtMs),
          value: item.cpu.total.mean,
          type: 'CPU 平均使用率',
        },
        {
          time: formatTimestamp(item.sampleAtMs),
          value: item.cpu.total.p95,
          type: 'CPU 平均使用率(95分位)',
        },
        {
          time: formatTimestamp(item.sampleAtMs),
          value: item.cpu.total.max,
          type: 'CPU 峰值',
        },
      ]
    })
  }, [data])

  const config = useLineGraphConfig(chartData, {
    fmtAxis: fmtPersentAxis,
    fmtTooltip: fmtPersentTooltip,
  })

  if (chartData.length === 0)
    return <div className="text-gray-400 text-center py-8">暂无 CPU 数据</div>

  return <Line {...config} />
}

const CpuDashboardArea = () => {
  return (
    <>
      <ChartCard title="CPU 使用趋势">
        <CPUChart />
      </ChartCard>
    </>
  )
}

export default memo(CpuDashboardArea)
