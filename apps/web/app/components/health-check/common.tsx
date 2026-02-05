'use client'

// 加载状态组件
export const LoadingState = () => {
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
export const EmptyState = () => {
  return (
    <div className="text-center text-gray-500 py-12 bg-linear-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
      <p className="font-medium">暂无健康监控数据</p>
      <p className="text-sm mt-1 text-gray-600">请等待系统采集数据</p>
    </div>
  )
}

// 卡片容器组件
export const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-base font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  )
}

// 统计卡片组件
export const StatCard = ({
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
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">
        {value}
        {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </div>
      {description && <div className="text-xs text-gray-400 mt-1">{description}</div>}
    </div>
  )
}
