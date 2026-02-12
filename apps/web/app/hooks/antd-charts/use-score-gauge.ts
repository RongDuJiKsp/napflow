import type { ParamTypeofReactComp } from '@/utils/type'
import type { Gauge } from '@ant-design/charts'
import { useCreation } from 'ahooks'

export const useScoreGaugeConfig = (title: string, score: number) => {
  // 麻了 导入的类型会导致实例化过深 只能这样写
  return useCreation<ParamTypeofReactComp<typeof Gauge>>(
    () => ({
      data: {
        target: score,
        total: 100,
        name: title,
      },
      legend: false,
      scale: {
        color: {
          // 分数越高越好：绿 -> 黄 -> 红
          range: ['#30BF78', '#FAAD14', '#F4664A'],
        },
      },
      style: {
        textContent: (target: number, _total: number) => `${target}`,
        textY: '65%',
      },
      height: 180,
    }),
    [score, title],
  )
}
