'use client'

import { Line } from '@ant-design/charts'
import { useMemo } from 'react'
import type { InternErrorTrendPoint } from '@/utils/data-report'
import { useLineGraphConfig } from '@/app/hooks/antd-charts/use-line-graph'
import { ChartCard } from './common'
import {
  convertTrendToChartData,
  formatCountAxis,
  formatCountTooltip,
} from './utils'

type TrendAreaProps = {
  trend: InternErrorTrendPoint[];
}

const TrendArea = ({ trend }: TrendAreaProps) => {
  const chartData = useMemo(() => convertTrendToChartData(trend), [trend])

  const config = useLineGraphConfig(chartData, {
    fmtAxis: formatCountAxis,
    fmtTooltip: formatCountTooltip,
  })

  return (
    <ChartCard title="分钟趋势（最近 30 分钟）">
      {chartData.length === 0
        ? <div className="py-8 text-center text-sm text-gray-400">暂无趋势数据</div>
        : <Line {...config} />}
    </ChartCard>
  )
}

export default TrendArea
