import dayjs from 'dayjs'
import type { InternErrorTrendPoint } from '@/utils/data-report/shared/error-report-contract'
import {
  InternErrorSource,
} from '@/utils/data-report/shared/error-report-contract'
import type { ChartTsItem } from '@/app/hooks/antd-charts/use-line-graph'

export const sourceLabel: Record<InternErrorSource, string> = {
  [InternErrorSource.WindowError]: 'Window Error',
  [InternErrorSource.UnhandledRejection]: 'Unhandled Rejection',
  [InternErrorSource.NextErrorBoundary]: 'Next Error Boundary',
  [InternErrorSource.NextGlobalErrorBoundary]: 'Next Global Error Boundary',
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
