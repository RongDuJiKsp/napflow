import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { LoopData } from '@shared/common/workflow/node-data/loop'
import { useLoopCurd } from './hooks/use-loop-curd'
import { Input, Label } from '@heroui/react'

const LoopPanel: ComponentPanelFc<LoopData> = ({ id, data }) => {
  const { handleMaxCountChange } = useLoopCurd(id)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-purple-600 text-xs font-semibold tracking-wide">
            循环次数
          </Label>
          <Input
            type="number"
            min={1}
            value={String(data.maxCount ?? 1)}
            onChange={e => handleMaxCountChange(Number(e.target.value))}
            className="border-purple-200 hover:border-purple-400 transition-colors rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}
export default memo(LoopPanel)
