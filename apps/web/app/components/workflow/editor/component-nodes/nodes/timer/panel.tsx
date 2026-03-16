import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { TimerData } from '@shared/common/workflow/node-data/timer'
import { Label } from '@heroui/react'
import InputWithEnv from '../../common/input-with-env'
import { useTimerCurd } from './hooks/use-timer-curd'

const TimerPanel: ComponentPanelFc<TimerData> = ({ id, data }) => {
  const { vars, handleTimeExprChange } = useTimerCurd(id)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-purple-600 text-xs font-semibold tracking-wide">
            触发时间
          </Label>
          <InputWithEnv
            envs={vars}
            value={data.timeExpr || ''}
            onChange={handleTimeExprChange}
            placeholder="输入 HH:mm 或 HH:mm:ss，输入 $ 引用变量"
            className={{
              contentEditable:
                'text-sm border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 p-2 transition-all',
              placeHolder: 'text-gray-300',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(TimerPanel)
