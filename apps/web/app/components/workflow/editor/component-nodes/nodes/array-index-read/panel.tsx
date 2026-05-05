import { memo, useCallback } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { ArrayIndexReadData } from '@shared/common/workflow/node-data/array-index-read'
import { Label } from '@heroui/react'
import VarSelect from '../../common/var-select'
import InputWithEnv from '../../common/input-with-env'
import { useArrayIndexReadCurd } from './hooks/use-array-index-read-curd'
import ProviderEnv from '../../common/provider-env'

const ArrayIndexReadPanel: ComponentPanelFc<ArrayIndexReadData> = ({
  id,
  data,
}) => {
  const { vars, arrayVars, handleSourceVarNameChange, handleIndexChange }
    = useArrayIndexReadCurd(id)

  const handleSourceVarChange = useCallback(
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
            数组变量
          </Label>
          <VarSelect
            value={data.sourceVarName}
            vars={arrayVars}
            onChange={handleSourceVarChange}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-purple-600 text-xs font-semibold tracking-wide">
            索引
          </Label>
          <InputWithEnv
            envs={vars}
            value={data.index}
            onChange={handleIndexChange}
            placeholder="输入数字或 $ 引用变量"
            className={{
              contentEditable:
                'text-sm border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 p-2 transition-all',
              placeHolder: 'text-gray-300',
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <ProviderEnv envs={data.vars} />
      </div>
    </div>
  )
}

export default memo(ArrayIndexReadPanel)
