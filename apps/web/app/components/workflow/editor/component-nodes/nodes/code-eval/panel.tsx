import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { CodeEvalData } from '@shared/common/workflow/node-data/code-eval'
import { Label, ListBox, Select } from '@heroui/react'
import InputWithEnv from '../../common/input-with-env'
import ProviderEnv from '../../common/provider-env'
import { useCodeEvalCurd } from './hooks/use-code-eval-curd'
import { VarTypes } from '@shared/common/workflow/core/component-node'

const CodeEvalPanel: ComponentPanelFc<CodeEvalData> = ({ id, data }) => {
  const {
    vars,
    handleArgAdd,
    handleArgRemove,
    handleArgKvTargetChange,
    handleArgTypeChange,
  } = useCodeEvalCurd(id)

  const args = data.args || []

  return (
    <div className="flex flex-col gap-3">

      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <Label className="text-purple-600 text-xs font-semibold tracking-wide">
            参数
          </Label>
          <button
            onClick={handleArgAdd}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            + 添加
          </button>
        </div>

        {args.length === 0 && (
          <span className="text-xs text-gray-400 italic">暂无参数</span>
        )}

        {args.map((item, index) => {
          const type = item.transJsValueType || VarTypes.String
          return (
            <div
              key={index}
              className="flex flex-col gap-1.5 p-2 rounded border border-purple-100 bg-white"
            >
              <div className="flex items-center gap-1">
                <div className="flex-1 min-w-0">
                  <InputWithEnv
                    envs={vars}
                    value={item.kvTarget}
                    onChange={v => handleArgKvTargetChange(index, v)}
                    placeholder="输入值或 $ 引用变量"
                    className={{
                      contentEditable:
                        'text-sm border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 p-2 transition-all',
                      placeHolder: 'text-gray-300',
                    }}
                  />
                </div>
                <button
                  onClick={() => handleArgRemove(index)}
                  className="text-gray-300 hover:text-red-400 text-xs shrink-0"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="shrink-0">类型</span>
                <Select
                  value={type}
                  onChange={v => handleArgTypeChange(index, v as VarTypes)}
                >
                  <Select.Trigger className="border-purple-200 hover:border-purple-400 transition-colors rounded w-40 min-h-8 h-8 px-2">
                    <span className="text-sm font-medium text-gray-700">
                      <Select.Value />
                    </span>
                  </Select.Trigger>
                  <Select.Popover className="min-w-40">
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

      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <ProviderEnv envs={data.vars} />
      </div>
    </div>
  )
}

export default memo(CodeEvalPanel)
