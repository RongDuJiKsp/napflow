import { memo, useCallback, useMemo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { IterateData } from '@shared/common/workflow/node-data/iterate'
import { Label, ListBox, Select ,type SelectProps} from '@heroui/react'
import { useIterateCurd } from './hooks/use-iterate-curd'
import { useComponentNodeEnv } from '../../hooks/use-component-node-env'
import {
  type Var,
  VarTypes,
} from '@shared/common/workflow/component-node'
import { twMerge } from 'tailwind-merge'

const typeColors: Record<Var['type'], string> = {
  [VarTypes.String]: 'bg-blue-100 text-blue-700',
  [VarTypes.Number]: 'bg-green-100 text-green-700',
  [VarTypes.StringArray]: 'bg-purple-100 text-purple-700',
  [VarTypes.NumberArray]: 'bg-pink-100 text-pink-700',
}

const typeLabels: Record<Var['type'], string> = {
  [VarTypes.String]: 'Str',
  [VarTypes.Number]: 'Num',
  [VarTypes.StringArray]: 'Str[]',
  [VarTypes.NumberArray]: 'Num[]',
}

const IteratePanel: ComponentPanelFc<IterateData> = ({ id, data }) => {
  const { vars } = useComponentNodeEnv(id)
  const { handleSourceVarNameChange } = useIterateCurd(id)

  const arrayVars = useMemo(
    () =>
      vars.filter(
        v => v.type === VarTypes.StringArray || v.type === VarTypes.NumberArray,
      ),
    [vars],
  )

  const handleSelectChange = useCallback<NonNullable<SelectProps<object>['onChange']>>(
    (ev) => {
      handleSourceVarNameChange(ev?.toString() || '')
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
          <Select
            value={data.sourceVarName}
            onChange={handleSelectChange}
          >
            <Select.Trigger className="border-purple-200 hover:border-purple-400 transition-colors rounded-lg">
              {data.sourceVarName || <Select.Value />}
            </Select.Trigger>
            <Select.Popover className="min-w-64">
              <ListBox>
                {arrayVars.map((v) => {
                  const value = `${v.source.id}.${v.name}`
                  return (
                    <ListBox.Item
                      key={value}
                      id={value}
                      className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="min-w-0 flex-1 truncate">
                          <span className="text-xs text-gray-400">{v.source.title} / </span>
                          <span className="text-sm font-medium text-gray-800">{v.name}</span>
                        </div>
                        <span
                          className={twMerge(
                            'text-xs px-1.5 py-0.5 rounded font-medium shrink-0',
                            typeColors[v.type],
                          )}
                        >
                          {typeLabels[v.type]}
                        </span>
                      </div>
                    </ListBox.Item>
                  )
                })}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default memo(IteratePanel)
