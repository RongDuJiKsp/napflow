import { memo, useCallback, useMemo } from 'react'
import { ListBox, Select, type SelectProps } from '@heroui/react'
import type { VarCtx } from '../../hooks/use-component-node-env'
import { getCommVarCtxName } from '../../hooks/use-component-node-env'
import { VarTypes } from '@shared/common/workflow/core/component-node'
import { twMerge } from 'tailwind-merge'

export const varTypeColors: Record<VarTypes, string> = {
  [VarTypes.String]: 'bg-blue-100 text-blue-700',
  [VarTypes.Number]: 'bg-green-100 text-green-700',
  [VarTypes.StringArray]: 'bg-purple-100 text-purple-700',
  [VarTypes.NumberArray]: 'bg-orange-100 text-orange-700',
}

export const varTypeLabels: Record<VarTypes, string> = {
  [VarTypes.String]: 'Str',
  [VarTypes.Number]: 'Num',
  [VarTypes.StringArray]: 'Str[]',
  [VarTypes.NumberArray]: 'Num[]',
}

//   变量选择器渲染项
const VarItem = ({ varCtx }: { varCtx: VarCtx }) => (
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
        varTypeColors[varCtx.type],
      )}
    >
      {varTypeLabels[varCtx.type]}
    </span>
  </div>
)

//   已选变量的显示组件
const SelectedVarDisplay = ({
  variable,
  vars,
}: {
  variable: string;
  vars: VarCtx[];
}) => {
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
          varTypeColors[found.type],
        )}
      >
        {varTypeLabels[found.type]}
      </span>
    </span>
  )
}

//   变量选择器
type VarSelectProps = {
  value: string;
  vars: VarCtx[];
  onChange: (value: string) => void;
}

const VarSelect = ({ value, vars, onChange }: VarSelectProps) => {
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

  const handleChange = useCallback<
    NonNullable<SelectProps<object>['onChange']>
  >(
    (v) => {
      onChange(v?.toString() || '')
    },
    [onChange],
  )

  return (
    <Select value={value} onChange={handleChange}>
      <Select.Trigger className="border-purple-200 hover:border-purple-400 transition-colors rounded-lg">
        {value ? (
          <SelectedVarDisplay variable={value} vars={vars} />
        ) : (
          <Select.Value />
        )}
      </Select.Trigger>
      <Select.Popover className="min-w-64">
        <ListBox>
          {groupedVars.flatMap(([sourceId, group]) => [
            <ListBox.Item
              key={`header-${sourceId}`}
              id={`header-${sourceId}`}
              className="px-2 py-1 bg-linear-to-r from-purple-50 to-pink-50 text-xs font-medium text-purple-600 border-b border-purple-100 pointer-events-none"
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
  )
}

export default memo(VarSelect)
