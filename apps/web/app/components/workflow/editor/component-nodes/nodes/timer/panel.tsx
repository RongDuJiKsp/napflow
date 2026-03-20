import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import {
  type TimerData,
  TimerTriggerMode,
} from '@shared/common/workflow/node-data/timer'
import { Label, ListBox, Select } from '@heroui/react'
import InputWithEnv from '../../common/input-with-env'
import { useTimerCurd } from './hooks/use-timer-curd'

const TimerPanel: ComponentPanelFc<TimerData> = ({ id, data }) => {
  const { vars, handleTimerModeChange, handleTimeExprChange }
    = useTimerCurd(id)
  const mode = data.mode ?? TimerTriggerMode.Schedule

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-purple-600 text-xs font-semibold tracking-wide">
            触发方式
          </Label>
          <Select
            value={mode}
            onChange={v => handleTimerModeChange(v as TimerTriggerMode)}
          >
            <Select.Trigger className="border-purple-200 hover:border-purple-400 transition-colors rounded-lg">
              <Select.Value />
            </Select.Trigger>
            <Select.Popover className="min-w-56">
              <ListBox>
                <ListBox.Item
                  id={TimerTriggerMode.Schedule}
                  className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors"
                >
                  <span className="text-sm">定时触发</span>
                </ListBox.Item>
                <ListBox.Item
                  id={TimerTriggerMode.Interval}
                  className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors"
                >
                  <span className="text-sm">间隔触发</span>
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-purple-600 text-xs font-semibold tracking-wide">
            {mode === TimerTriggerMode.Schedule ? '触发时间' : '触发间隔(分钟)'}
          </Label>
          <InputWithEnv
            envs={vars}
            value={String(data.timeExpr ?? '')}
            onChange={handleTimeExprChange}
            placeholder={
              mode === TimerTriggerMode.Schedule
                ? '输入 HH:mm，输入 $ 引用变量'
                : '输入间隔分钟数，输入 $ 引用变量'
            }
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
