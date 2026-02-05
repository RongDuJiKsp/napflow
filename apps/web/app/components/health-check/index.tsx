'use client'
import { useHealthSamplesQuery } from '@/app/hooks/query/use-health-samples-query'
import { memo, useMemo } from 'react'
import { Gauge, Line } from '@ant-design/charts'
import { useCreation } from 'ahooks'
import dayjs from 'dayjs'

// 加载状态组件
const LoadingState = () => {
  return (
    <div className="flex items-center justify-center p-8 h-64">
      <div className="flex items-center space-x-3 text-blue-600">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">加载健康数据中...</span>
      </div>
    </div>
  )
}

// 空状态组件
const EmptyState = () => {
  return (
    <div className="text-center text-gray-500 py-12 bg-linear-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
      <p className="font-medium">暂无健康监控数据</p>
      <p className="text-sm mt-1 text-gray-600">请等待系统采集数据</p>
    </div>
  )
}

// 卡片容器组件
const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-base font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  )
}

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
  return dayjs(timestamp).format('HH:mm:ss')
}

// 格式化字节大小
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// CPU 图表组件
const CPUChart = () => {
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

  const config = useCreation(
    () => ({
      data: chartData,
      xField: 'time',
      yField: 'value',
      colorField: 'type',
      axis: {
        y: {
          labelFormatter: (v: number) => `${v.toFixed(1)}%`,
        },
      },
      tooltip: {
        items: [
          {
            channel: 'y',
            valueFormatter: (v: number) => `${v.toFixed(2)}%`,
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
    return <div className="text-gray-400 text-center py-8">暂无 CPU 数据</div>

  return <Line {...config} />
}

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
const MemoryUtilizationGauge = () => {
  const { data } = useHealthSamplesQuery()

  const memoryHealthScore = useMemo(() => {
    if (!data || data.length === 0) return 0
    const latest = data[data.length - 1]
    if (!latest?.memory) return 0
    // 剩余可用内存百分比，越高越健康
    return Math.floor(latest.memory.utilization.mean)
  }, [data])

  const config = useCreation(
    () => ({
      data: {
        target: memoryHealthScore,
        total: 100,
        name: '内存健康度',
      },
      legend: false,
      scale: {
        color: {
          // 分数越高越好：绿 -> 黄 -> 红
          range: ['#30BF78', '#FAAD14', '#F4664A'],
        },
      },
      style: {
        textContent: (target: number, total: number) => `${target}`,
        textY: '65%',
      },
      height: 180,
    }),
    [memoryHealthScore],
  )

  return <Gauge {...config} />
}

// 事件循环图表组件
const EventLoopChart = () => {
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

  const config = useCreation(
    () => ({
      data: chartData,
      xField: 'time',
      yField: 'value',
      colorField: 'type',
      axis: {
        y: {
          labelFormatter: (v: number) => `${v.toFixed(1)}ms`,
        },
      },
      tooltip: {
        items: [
          {
            channel: 'y',
            valueFormatter: (v: number) => `${v.toFixed(2)}ms`,
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
    return <div className="text-gray-400 text-center py-8">暂无事件循环数据</div>

  return <Line {...config} />
}

// 事件循环健康分数仪表盘
const EventLoopHealthGauge = () => {
  const { data } = useHealthSamplesQuery()

  const healthScore = useMemo(() => {
    if (!data || data.length === 0) return 0
    const latest = data[data.length - 1]
    if (!latest?.eventLoop) return 0
    return latest.eventLoop.healthScore
  }, [data])

  const config = useCreation(
    () => ({
      data: {
        target: healthScore,
        total: 100,
        name: '事件循环健康度',
      },
      legend: false,
      scale: {
        color: {
          // 分数越高越好：绿 -> 黄 -> 红
          range: ['#30BF78', '#FAAD14', '#F4664A'],
        },
      },
      style: {
        textContent: (target: number, total: number) => `${target}`,
        textY: '65%',
      },
      height: 180,
    }),
    [healthScore],
  )

  return <Gauge {...config} />
}

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

  const config = useCreation(
    () => ({
      data: {
        target: healthScore,
        total: 100,
        name: 'GC 健康度',
      },
      legend: false,
      scale: {
        color: {
          // 分数越高越好：绿 -> 黄 -> 红
          range: ['#30BF78', '#FAAD14', '#F4664A'],
        },
      },
      style: {
        textContent: (target: number, total: number) => `${target}`,
        textY: '65%',
      },
      height: 180,
    }),
    [healthScore],
  )

  return <Gauge {...config} />
}

// 统计卡片组件
const StatCard = ({
  title,
  value,
  unit,
  description,
}: {
  title: string
  value: string | number
  unit?: string
  description?: string
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">
        {value}
        {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </div>
      {description && <div className="text-xs text-gray-400 mt-1">{description}</div>}
    </div>
  )
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

const HealthCheckDashboard = () => {
  const { data, isLoading } = useHealthSamplesQuery()

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">系统健康监控</h2>
        <LoadingState />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">系统健康监控</h2>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">系统健康监控</h2>
        <span className="text-sm text-gray-500">
          最后更新: {formatTimestamp(data[data.length - 1].timestamp)}
        </span>
      </div>

      {/* 仪表盘区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="内存健康度">
          <MemoryUtilizationGauge />
        </ChartCard>
        <ChartCard title="事件循环健康度">
          <EventLoopHealthGauge />
        </ChartCard>
        <ChartCard title="GC 健康度">
          <GCHealthGauge />
        </ChartCard>
      </div>

      {/* 趋势图区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="CPU 使用趋势">
          <CPUChart />
        </ChartCard>
        <ChartCard title="内存使用趋势">
          <MemoryChart />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="事件循环延迟趋势">
          <EventLoopChart />
        </ChartCard>
        <ChartCard title="GC 统计信息">
          <GCStats />
        </ChartCard>
      </div>
    </div>
  )
}

export default memo(HealthCheckDashboard)
