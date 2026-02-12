import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { CompareOperator, IfData } from '@shared/common/workflow/node-data/if'
import { BranchType, CompareOperatorLabels } from '@shared/common/workflow/node-data/if'
import { Button, Label, ListBox, Select } from '@heroui/react'
import InputWithEnv from '../../common/input-with-env'
import { useIfCurd } from './hooks/use-if-curd'
import type { VarCtx } from '../../hooks/use-component-node-env'
import { getCommVarCtxName } from '../../hooks/use-component-node-env'
import { RiAddLine, RiCloseLine } from '@remixicon/react'

// 单个条件编辑器
const ConditionEditor = memo(({
  branchId,
  variable,
  operator,
  value,
  vars,
  onConditionChange,
}: {
  branchId: string
  variable: string
  operator: CompareOperator
  value: string
  vars: VarCtx[]
  onConditionChange: (branchId: string, field: 'variable' | 'operator' | 'value', value: string) => void
}) => {
  return (
    <div className="flex flex-col gap-2">
      {/* 选择变量 */}
      <Select
        value={variable}
        onChange={v => onConditionChange(branchId, 'variable', v as string)}
      >
        <Label className="text-purple-700 text-xs">变量</Label>
        <Select.Trigger>
          <Select.Value placeholder="选择一个变量" />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {vars.map(v => (
              <ListBox.Item key={getCommVarCtxName(v)} id={getCommVarCtxName(v)}>
                {v.source.title}.{v.name} ({v.type})
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      {/* 选择操作符 */}
      <Select
        value={operator}
        onChange={v => onConditionChange(branchId, 'operator', v as string)}
      >
        <Label className="text-purple-700 text-xs">条件</Label>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {Object.entries(CompareOperatorLabels).map(([key, label]) => (
              <ListBox.Item key={key} id={key}>
                {label}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      {/* 比较值 */}
      <div className="flex flex-col gap-1">
        <Label className="text-purple-700 text-xs">比较值</Label>
        <InputWithEnv
          envs={vars}
          value={value}
          onChange={v => onConditionChange(branchId, 'value', v)}
          placeholder="输入比较值，输入 {{ 引用变量"
          className={{
            contentEditable:
              'text-sm border border-purple-500 rounded-sm focus:border-purple-700 p-2',
            placeHolder: 'text-pink-200',
          }}
        />
      </div>
    </div>
  )
})
ConditionEditor.displayName = 'ConditionEditor'

const IfPanel: ComponentPanelFc<IfData> = ({ id, data }) => {
  const {
    vars,
    handleConditionChange,
    handleAddElseIf,
    handleAddElse,
    handleRemoveBranch,
    hasElse,
  } = useIfCurd(id)

  return (
    <div className="flex flex-col gap-3">
      {data.branches.map((branch, index) => {
        const branchLabel
          = branch.type === BranchType.If
            ? 'IF 条件'
            : branch.type === BranchType.ElseIf
              ? `ELSE IF 条件 #${index}`
              : 'ELSE（默认分支）'

        return (
          <div
            key={branch.id}
            className="flex flex-col gap-2 p-3 bg-white/80 rounded-lg border border-pink-200"
          >
            {/* 分支标题和删除按钮 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-700">
                {branchLabel}
              </span>
              {/* 第一个if分支不可删除 */}
              {index > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => handleRemoveBranch(branch.id)}
                  className="text-red-400 hover:text-red-600 min-w-0 p-1"
                >
                  <RiCloseLine className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* 条件编辑器（else分支没有条件） */}
            {branch.type !== BranchType.Else && branch.condition && (
              <ConditionEditor
                branchId={branch.id}
                variable={branch.condition.variable}
                operator={branch.condition.operator}
                value={branch.condition.value}
                vars={vars}
                onConditionChange={handleConditionChange}
              />
            )}

            {branch.type === BranchType.Else && (
              <div className="text-xs text-gray-400 italic">
                当以上所有条件都不满足时执行此分支
              </div>
            )}
          </div>
        )
      })}

      {/* 操作按钮 */}
      <div className="flex gap-2 border-t border-pink-200 pt-3">
        <Button
          size="sm"
          variant="bordered"
          onPress={handleAddElseIf}
          className="border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <RiAddLine className="h-3 w-3" />
          添加 Else If
        </Button>
        {!hasElse(data.branches) && (
          <Button
            size="sm"
            variant="bordered"
            onPress={handleAddElse}
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <RiAddLine className="h-3 w-3" />
            添加 Else
          </Button>
        )}
      </div>
    </div>
  )
}

export default memo(IfPanel)
