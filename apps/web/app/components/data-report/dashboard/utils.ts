import dayjs from 'dayjs'
import type {
  InternErrorSource,
  InternErrorTrendPoint,
} from '@/utils/data-report'
import type { ChartTsItem } from '@/app/hooks/antd-charts/use-line-graph'

export const sourceLabel: Record<InternErrorSource, string> = {
  'window-error': 'Window Error',
  'unhandledrejection': 'Unhandled Rejection',
  'next-error-boundary': 'Next Error Boundary',
  'next-global-error-boundary': 'Next Global Error Boundary',
}

export const formatDateTime = (timeMs: number) => {
  return dayjs(timeMs).format('YYYY-MM-DD HH:mm:ss')
}

export const formatMinute = (timeMs: number) => {
  return dayjs(timeMs).format('HH:mm')
}

export const formatCountAxis = (value: number) => `${value.toFixed(0)}`

export const formatCountTooltip = (value: number) => `${value.toFixed(0)} 次`

export const convertTrendToChartData = (
  trend: InternErrorTrendPoint[],
): ChartTsItem[] => {
  return trend.map(item => ({
    time: formatMinute(item.minuteStartMs),
    value: item.count,
    type: '异常次数',
  }))
}
