import { useLineGraphConfig } from '@/app/hooks/antd-charts/use-line-graph'
import { useBotHealthCheckQuery } from '@/app/hooks/query/use-bot-health-check-query'
import { Line } from '@ant-design/charts'
import { memo, useMemo } from 'react'
import { formatTimestamp } from '../../health-check/utils'
import { useBotParam } from '../hooks/use-bot-param'
import { ChartCard } from '../../health-check/common'

// 节点队列长度图表
const NodeQueueChart = () => {
  const { botId } = useBotParam()
  const { data } = useBotHealthCheckQuery(botId)

  const chartData = useMemo(() => {
    if (!data) return []
    return data.flatMap((item) => {
      return [
        {
          time: formatTimestamp(item.sampleAt),
          value: item.nodeQueueLength.mean,
          type: '节点队列长度(均值)',
        },
        {
          time: formatTimestamp(item.sampleAt),
          value: item.nodeQueueLength.p95,
          type: '节点队列长度 P95',
        },
      ]
    })
  }, [data])

  const config = useLineGraphConfig(chartData)

  if (chartData.length === 0)
    return <div className="text-gray-400 text-center py-8">暂无节点队列数据</div>

  return <Line {...config} />
}

const NodeQueueArea = () => {
  return (
    <ChartCard title="节点队列长度趋势">
      <NodeQueueChart />
    </ChartCard>
  )
}

export default memo(NodeQueueArea)
