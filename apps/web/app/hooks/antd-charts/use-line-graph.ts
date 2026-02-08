import { useCreation } from 'ahooks'

export type ChartTsItem = {
  time: string;
  value: number;
  type: string;
}
export type ValueFmt = (v: number) => string

export const useLineGraphConfig = (chartData: ChartTsItem[], { fmtAxis, fmtTooltip}: { fmtAxis?: ValueFmt, fmtTooltip?: ValueFmt } = {}) => {
  return useCreation(
    () => ({
      data: chartData,
      xField: 'time',
      yField: 'value',
      colorField: 'type',
      axis: {
        y: {
          labelFormatter: fmtAxis,
        },
      },
      tooltip: {
        items: [
          {
            channel: 'y',
            valueFormatter: fmtTooltip,
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
}
