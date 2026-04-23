'use client'

export const LoadingState = () => {
  return (
    <div className="flex h-64 items-center justify-center p-8">
      <div className="flex items-center space-x-3 text-emerald-600">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <span className="text-sm font-medium">加载上报数据中...</span>
      </div>
    </div>
  )
}

export const EmptyState = () => {
  return (
    <div className="rounded-xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-cyan-50 py-12 text-center text-gray-500">
      <p className="font-medium">当前窗口内没有异常</p>
      <p className="mt-1 text-sm text-gray-600">系统运行稳定，暂无未捕获错误</p>
    </div>
  )
}

export const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-gray-800">{title}</h3>
      {children}
    </div>
  )
}

export const StatCard = ({
  title,
  value,
}: {
  title: string;
  value: number;
}) => {
  return (
    <div className="rounded-lg border border-emerald-100 bg-linear-to-br from-emerald-50 to-cyan-50 p-4">
      <div className="mb-1 text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  )
}
