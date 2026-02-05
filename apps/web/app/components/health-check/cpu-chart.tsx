'use client'
import { useHealthSamplesQuery } from '@/app/hooks/query/use-health-samples-query'
import { useMemo } from 'react'
import { Line } from '@ant-design/charts'
import { formatTimestamp } from './utils'
import { useLineGraphConfig } from './hooks/use-line-graph'
import { fmtAxis, fmtTooltip } from './utils'
// CPU 图表组件
export const CPUChart = () => {
  const { data } = useHealthSamplesQuery()

  const chartData = useMemo(() => {
    if (!data) return []
    return data.flatMap((item) => {
      if (!item.cpu) return []
      return [
        {
          time: formatTimestamp(item.timestamp),
          value: item.cpu.total.mean,
          type: 'CPU 平均使用率',
        },
        {
          time: formatTimestamp(item.timestamp),
          value: item.cpu.total.max,
          type: 'CPU 峰值',
        },
      ]
    })
  }, [data])

  const config = useLineGraphConfig(chartData, { fmtAxis, fmtTooltip })

  if (chartData.length === 0)
    return <div className="text-gray-400 text-center py-8">暂无 CPU 数据</div>

  return <Line {...config} />
}
