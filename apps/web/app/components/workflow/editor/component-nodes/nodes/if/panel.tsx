import { memo, useMemo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { CompareOperator, IfData } from '@shared/common/workflow/node-data/if'
import { BranchType, CompareOperatorLabels } from '@shared/common/workflow/node-data/if'
import { Button, Label, ListBox, Select } from '@heroui/react'
import InputWithEnv from '../../common/input-with-env'
import { useIfCurd } from './hooks/use-if-curd'
import type { VarCtx } from '../../hooks/use-component-node-env'
import { getCommVarCtxName } from '../../hooks/use-component-node-env'
import { RiAddLine, RiCloseLine } from '@remixicon/react'
import { VarTypes } from '@shared/common/workflow/component-node'
import { twMerge } from 'tailwind-merge'

// ─── 类型颜色映射（与 EnvVarMenuPlugin / workflow-env 保持一致）───
const typeColors: Record<VarTypes, string> = {
  [VarTypes.String]: 'bg-blue-100 text-blue-700',
  [VarTypes.Number]: 'bg-green-100 text-green-700',
  [VarTypes.StringArray]: 'bg-purple-100 text-purple-700',
  [VarTypes.NumberArray]: 'bg-orange-100 text-orange-700',
}

const typeLabels: Record<VarTypes, string> = {
  [VarTypes.String]: 'Str',
  [VarTypes.Number]: 'Num',
  [VarTypes.StringArray]: 'Str[]',
  [VarTypes.NumberArray]: 'Num[]',
}

// ─── 操作符分组（字符串类 / 数值类）───
const stringOperators = [
  'string_equal',
  'contains',
  'contained_by',
  'not_contains',
  'not_contained_by',
] as CompareOperator[]

const numberOperators = [
  'number_gt',
  'number_lt',
  'number_gte',
  'number_lte',
] as CompareOperator[]

// 操作符颜色
const operatorColors: Record<string, string> = {
  string_equal: 'text-blue-600',
  contains: 'text-blue-600',
  contained_by: 'text-blue-600',
  not_contains: 'text-red-500',
  not_contained_by: 'text-red-500',
  number_gt: 'text-green-600',
  number_lt: 'text-green-600',
  number_gte: 'text-emerald-600',
  number_lte: 'text-emerald-600',
}

// ─── 变量选择器渲染项 ───
const VarItem = memo(({ varCtx }: { varCtx: VarCtx }) => (
  <div className="flex items-center justify-between w-full gap-2">
    <div className="flex items-center gap-1.5 min-w-0 flex-1">
      <span className="text-xs text-gray-400 shrink-0 truncate max-w-20">
        {varCtx.source.title}
      </span>
      <span className="text-gray-300">/</span>
      <span className="text-sm font-medium text-gray-800 truncate">
        {varCtx.name}
      </span>
    </div>
    <span
      className={twMerge(
        'text-xs px-1.5 py-0.5 rounded font-medium shrink-0',
        typeColors[varCtx.type],
      )}
    >
      {typeLabels[varCtx.type]}
    </span>
  </div>
))
VarItem.displayName = 'VarItem'

// ─── 已选变量的显示组件 ───
const SelectedVarDisplay = memo(({ variable, vars }: { variable: string; vars: VarCtx[] }) => {
  const found = useMemo(
    () => vars.find(v => getCommVarCtxName(v) === variable),
    [vars, variable],
  )

  if (!found)
    return <span className="text-gray-400 text-sm">选择一个变量</span>

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs text-gray-400">{found.source.title} /</span>
      <span className="text-sm font-medium text-gray-800">{found.name}</span>
      <span
        className={twMerge(
          'text-xs px-1 py-0.5 rounded font-medium',
          typeColors[found.type],
        )}
      >
        {typeLabels[found.type]}
      </span>
    </span>
  )
})
SelectedVarDisplay.displayName = 'SelectedVarDisplay'

// ─── 单个条件编辑器 ───
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
  // 按 source 分组
  const groupedVars = useMemo(() => {
    const map = new Map<string, { title: string; vars: VarCtx[] }>()
    for (const v of vars) {
      const key = v.source.id
      if (!map.has(key)) map.set(key, { title: v.source.title, vars: [] })
      map.get(key)!.vars.push(v)
    }
    return Array.from(map.entries())
  }, [vars])

  return (
    <div className="flex flex-col gap-2.5">
      {/* ─── 选择变量 ─── */}
      <div className="flex flex-col gap-1">
        <Label className="text-purple-600 text-xs font-semibold tracking-wide">变量</Label>
        <Select
          value={variable}
          onChange={v => onConditionChange(branchId, 'variable', v as string)}
        >
          <Select.Trigger className="border-purple-200 hover:border-purple-400 transition-colors rounded-lg">
            {variable
              ? <SelectedVarDisplay variable={variable} vars={vars} />
              : <Select.Value />}
          </Select.Trigger>
          <Select.Popover className="min-w-64">
            <ListBox>
              {groupedVars.flatMap(([sourceId, group]) => [
                <ListBox.Item
                  key={`header-${sourceId}`}
                  id={`header-${sourceId}`}
                  className="px-2 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-xs font-medium text-purple-600 border-b border-purple-100 pointer-events-none"
                >
                  {group.title}
                </ListBox.Item>,
                ...group.vars.map(v => (
                  <ListBox.Item
                    key={getCommVarCtxName(v)}
                    id={getCommVarCtxName(v)}
                    className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors"
                  >
                    <VarItem varCtx={v} />
                  </ListBox.Item>
                )),
              ])}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* ─── 选择操作符 ─── */}
      <div className="flex flex-col gap-1">
        <Label className="text-purple-600 text-xs font-semibold tracking-wide">条件</Label>
        <Select
          value={operator}
          onChange={v => onConditionChange(branchId, 'operator', v as string)}
        >
          <Select.Trigger className="border-purple-200 hover:border-purple-400 transition-colors rounded-lg">
            <span className={twMerge('text-sm font-medium', operatorColors[operator] || 'text-gray-700')}>
              {CompareOperatorLabels[operator] || '选择条件'}
            </span>
          </Select.Trigger>
          <Select.Popover className="min-w-56">
            <ListBox>
              {/* 字符串操作组标题 */}
              <ListBox.Item
                key="header-string"
                id="header-string"
                className="px-2 py-1 bg-blue-50 text-xs font-medium text-blue-600 border-b border-blue-100 pointer-events-none"
              >
                字符串比较
              </ListBox.Item>
              {stringOperators.map(key => (
                <ListBox.Item
                  key={key}
                  id={key}
                  className="px-2 py-1.5 cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <span className={twMerge('text-sm', operatorColors[key])}>
                    {CompareOperatorLabels[key]}
                  </span>
                </ListBox.Item>
              ))}
              {/* 数值操作组标题 */}
              <ListBox.Item
                key="header-number"
                id="header-number"
                className="px-2 py-1 bg-green-50 text-xs font-medium text-green-600 border-b border-green-100 pointer-events-none"
              >
                数值比较
              </ListBox.Item>
              {numberOperators.map(key => (
                <ListBox.Item
                  key={key}
                  id={key}
                  className="px-2 py-1.5 cursor-pointer hover:bg-green-50 transition-colors"
                >
                  <span className={twMerge('text-sm', operatorColors[key])}>
                    {CompareOperatorLabels[key]}
                  </span>
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* ─── 比较值 ─── */}
      <div className="flex flex-col gap-1">
        <Label className="text-purple-600 text-xs font-semibold tracking-wide">比较值</Label>
        <InputWithEnv
          envs={vars}
          value={value}
          onChange={v => onConditionChange(branchId, 'value', v)}
          placeholder="输入比较值，输入 $ 引用变量"
          className={{
            contentEditable:
              'text-sm border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 p-2 transition-all',
            placeHolder: 'text-gray-300',
          }}
        />
      </div>
    </div>
  )
})
ConditionEditor.displayName = 'ConditionEditor'

// ─── 分支标签颜色 ───
const branchLabelStyles: Record<BranchType, string> = {
  [BranchType.If]: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
  [BranchType.ElseIf]: 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white',
  [BranchType.Else]: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
}

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
            ? 'IF'
            : branch.type === BranchType.ElseIf
              ? `ELSE IF #${index}`
              : 'ELSE'

        return (
          <div
            key={branch.id}
            className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* 分支标题和删除按钮 */}
            <div className="flex items-center justify-between">
              <span
                className={twMerge(
                  'text-xs font-bold px-2.5 py-1 rounded-full tracking-wider',
                  branchLabelStyles[branch.type],
                )}
              >
                {branchLabel}
              </span>
              {/* 第一个if分支不可删除 */}
              {index > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => handleRemoveBranch(branch.id)}
                  className="text-gray-300 hover:text-red-500 min-w-0 p-1 transition-colors"
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
              <div className="text-xs text-gray-400 italic px-1 py-2">
                当以上所有条件都不满足时执行此分支
              </div>
            )}
          </div>
        )
      })}

      {/* 操作按钮 */}
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant="ghost"
          onPress={handleAddElseIf}
          className="border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-400 rounded-lg transition-colors"
        >
          <RiAddLine className="h-3.5 w-3.5" />
          添加 Else If
        </Button>
        {!hasElse(data.branches) && (
          <Button
            size="sm"
            variant="ghost"
            onPress={handleAddElse}
            className="border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-colors"
          >
            <RiAddLine className="h-3.5 w-3.5" />
            添加 Else
          </Button>
        )}
      </div>
    </div>
  )
}

export default memo(IfPanel)
