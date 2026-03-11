import { memo, useCallback } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { IterateData } from '@shared/common/workflow/node-data/iterate'
import { Label } from '@heroui/react'
import { useIterateCurd } from './hooks/use-iterate-curd'
import VarSelect from '../../common/var-select'

const IteratePanel: ComponentPanelFc<IterateData> = ({ id, data }) => {
  const { arrayVars, handleSourceVarNameChange } = useIterateCurd(id)

  const handleChange = useCallback(
    (value: string) => {
      handleSourceVarNameChange(value)
    },
    [handleSourceVarNameChange],
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-purple-600 text-xs font-semibold tracking-wide">
            迭代数组变量
          </Label>
          <VarSelect
            value={data.sourceVarName}
            vars={arrayVars}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(IteratePanel)
