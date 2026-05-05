import { memo, useCallback } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { JsonReadData } from '@shared/common/workflow/node-data/json-read'
import { Label, ListBox, Select } from '@heroui/react'
import VarSelect from '../../common/var-select'
import { useJsonReadCurd } from './hooks/use-json-read-curd'
import { VarTypes } from '@shared/common/workflow/core/component-node'
import { twMerge } from 'tailwind-merge'

const outputTypeTextStyles: Record<VarTypes, string> = {
  [VarTypes.String]: 'text-cyan-700',
  [VarTypes.Number]: 'text-purple-700',
  [VarTypes.StringArray]: 'text-violet-700',
  [VarTypes.NumberArray]: 'text-amber-700',
}

const JsonReadPanel: ComponentPanelFc<JsonReadData> = ({ id, data }) => {
  const {
    stringVars,
    handleSourceVarNameChange,
    handleOutputAdd,
    handleOutputRemove,
    handleOutputNameChange,
    handleOutputFieldChange,
    handleOutputTypeChange,
  } = useJsonReadCurd(id)

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
            JSON 字符串变量
          </Label>
          <VarSelect
            value={data.sourceVarName}
            vars={stringVars}
            onChange={handleSourceVarChange}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <Label className="text-purple-600 text-xs font-semibold tracking-wide">
            输出绑定
          </Label>
          <button
            onClick={handleOutputAdd}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            + 添加
          </button>
        </div>

        {data.outputs.length === 0 && (
          <span className="text-xs text-gray-400 italic">暂无输出变量绑定</span>
        )}

        {data.outputs.map((item, index) => {
          const type = item.type || VarTypes.String
          return (
            <div
              key={index}
              className={twMerge(
                'flex flex-col gap-1.5 p-2 rounded border bg-white',
                type === VarTypes.String && 'border-cyan-100 bg-cyan-50/30',
                type === VarTypes.Number
                  && 'border-purple-100 bg-purple-50/30',
                type === VarTypes.StringArray
                  && 'border-violet-100 bg-violet-50/30',
                type === VarTypes.NumberArray
                  && 'border-amber-100 bg-amber-50/30',
              )}
            >
              <div className="flex items-center gap-1">
                <input
                  value={item.name}
                  onChange={e =>
                    handleOutputNameChange(index, e.target.value)
                  }
                  placeholder="输出变量名"
                  className="text-xs border border-purple-200 rounded p-1.5 flex-1 min-w-0 outline-none focus:border-purple-400"
                />
                <button
                  onClick={() => handleOutputRemove(index)}
                  className="text-gray-300 hover:text-red-400 text-xs shrink-0"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span className="shrink-0">字段</span>
                <input
                  value={item.field}
                  onChange={e =>
                    handleOutputFieldChange(index, e.target.value)
                  }
                  placeholder="如 a"
                  className="text-xs border border-purple-200 rounded p-1.5 flex-1 min-w-0 outline-none focus:border-purple-400"
                />
                <Select
                  value={type}
                  onChange={v => handleOutputTypeChange(index, v as VarTypes)}
                >
                  <Select.Trigger className="border-purple-200 hover:border-purple-400 transition-colors rounded w-32 min-h-8 h-8 px-2">
                    <span
                      className={twMerge(
                        'text-sm font-medium',
                        outputTypeTextStyles[type],
                      )}
                    >
                      <Select.Value />
                    </span>
                  </Select.Trigger>
                  <Select.Popover className="min-w-36">
                    <ListBox>
                      <ListBox.Item
                        id={VarTypes.String}
                        className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors"
                      >
                        <span className="text-sm">string</span>
                      </ListBox.Item>
                      <ListBox.Item
                        id={VarTypes.Number}
                        className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors"
                      >
                        <span className="text-sm">number</span>
                      </ListBox.Item>
                      <ListBox.Item
                        id={VarTypes.StringArray}
                        className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors"
                      >
                        <span className="text-sm">Array&lt;string&gt;</span>
                      </ListBox.Item>
                      <ListBox.Item
                        id={VarTypes.NumberArray}
                        className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors"
                      >
                        <span className="text-sm">Array&lt;number&gt;</span>
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(JsonReadPanel)
