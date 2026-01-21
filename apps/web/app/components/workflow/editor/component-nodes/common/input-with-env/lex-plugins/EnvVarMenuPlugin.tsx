'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import { $getSelection, $isRangeSelection } from 'lexical'
import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { twMerge } from 'tailwind-merge'
import { type VarCtx, getCommVarCtxName } from '../../../hooks/use-component-node-env'
import { VarTypes } from '../../../types'
import { $createEnvVarNode } from '../lex-nodes/env-var-node'

// 类型颜色映射
const typeColors = {
  [VarTypes.String]: 'bg-blue-100 text-blue-700',
  [VarTypes.Number]: 'bg-green-100 text-green-700',
  [VarTypes.StringArray]: 'bg-purple-100 text-purple-700',
  [VarTypes.NumberArray]: 'bg-orange-100 text-orange-700',
}

// 类型标签映射
const typeLabels = {
  [VarTypes.String]: 'Str',
  [VarTypes.Number]: 'Num',
  [VarTypes.StringArray]: 'Str[]',
  [VarTypes.NumberArray]: 'Num[]',
}

class VarOption extends MenuOption {
  sourceId: string
  sourceTitle: string
  var: VarCtx
  constructor(varCtx: VarCtx) {
    super(varCtx.source.id + varCtx.name)
    this.var = varCtx
    this.sourceId = varCtx.source.id
    this.sourceTitle = varCtx.source.title
  }
}
// 菜单项组件
const EnvVarMenuItem = ({
  option,
  isSelected,
  onClick,
  onMouseEnter,
}: {
  option: VarOption;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) => {
  return (
    <div
      className={twMerge(
        'flex items-center justify-between px-2 py-1 cursor-pointer transition-colors duration-200',
        'hover:bg-purple-50',
        isSelected && 'bg-linear-to-r from-purple-100 to-pink-100',
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <span className="text-sm text-gray-900 truncate flex-1">
        {option.var.name}
      </span>
      <span
        className={twMerge(
          'text-xs px-1.5 py-0.5 rounded font-medium ml-1.5 shrink-0',
          typeColors[option.var.type],
        )}
      >
        {typeLabels[option.var.type]}
      </span>
    </div>
  )
}

const EnvVarSubMenu = ({
  title,
  options,
  selectedIndex,
  onClick,
  onMouseEnter,
}: {
  title: string;
  options: VarOption[];
  selectedIndex?: number;
  onClick: (option: VarOption, index: number) => void;
  onMouseEnter: (option: VarOption, index: number) => void;
}) => {
  return (
    <div>
      <div className="px-1 py-0.5 bg-linear-to-r from-purple-50 to-pink-50 border-b border-purple-100">
        <span className="text-xs font-medium text-purple-700">{title}</span>
      </div>
      {options.map((option, optionIndex) => {
        const handleItemClick = () => onClick(option, optionIndex)
        const handleItemMouseEnter = () => onMouseEnter(option, optionIndex)
        return (
          <EnvVarMenuItem
            key={option.key}
            option={option}
            isSelected={
              selectedIndex !== undefined && selectedIndex === optionIndex
            }
            onClick={handleItemClick}
            onMouseEnter={handleItemMouseEnter}
          />
        )
      })}
    </div>
  )
}

type LexicalTypeaheadMenuPluginProps = Parameters<typeof LexicalTypeaheadMenuPlugin<VarOption>>['0']

const EnvVarMenuPlugin = ({
  envVars,
  triggerAt = '$',
}: {
  envVars: VarCtx[];
  triggerAt?: string;
}) => {
  const [editor] = useLexicalComposerContext()
  // 查询字符串 触发方式为 [prefix][queryString] 例如 $foo 为查询 foo
  const [queryString, setQueryString] = useState<string | null>(null)

  // 创建菜单选项
  const filteredEnvVars = useMemo(() => {
    if (!queryString) return envVars.map(envVar => new VarOption(envVar))
    return envVars
      .filter(
        envVar =>
          envVar.name.toLowerCase().includes(queryString)
          || envVar.source.title.toLowerCase().includes(queryString),
      )
      .map(envVar => new VarOption(envVar))
  }, [envVars, queryString])

  // 按节点分组
  const groupedEnvVars = useMemo(() => {
    const grouped = filteredEnvVars.reduce(
      (acc, option) => {
        const sourceId = option.sourceId
        if (!acc[sourceId])
          acc[sourceId] = { title: option.sourceTitle, options: [] }

        acc[sourceId].options.push(option)
        return acc
      },
      {} as Record<string, { title: string; options: VarOption[] }>,
    )
    return Object.entries(grouped).map(([sourceId, ext]) => ({
      sourceId,
      ext,
    }))
  }, [filteredEnvVars])

  // 触发匹配检查
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(triggerAt, {
    minLength: 0,
  })

  // 选择选项回调
  const onSelectOption = useCallback<LexicalTypeaheadMenuPluginProps['onSelectOption']>(
    (
      selectedOption,
      nodeToRemove,
      closeMenu,
    ) => {
      editor.update(() => {
        const selection = $getSelection()

        if (!$isRangeSelection(selection) || selectedOption == null) return

        // 移除触发文本
        if (nodeToRemove) nodeToRemove.remove()

        // 插入环境变量节点
        selection.insertNodes([$createEnvVarNode(getCommVarCtxName(selectedOption.var), envVars)])
      })

      closeMenu()
    },
    [editor, envVars],
  )

  const menuRenderFn = useCallback<LexicalTypeaheadMenuPluginProps['menuRenderFn']>(
    (
      anchorElementRef,
      { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
    ) => {
      if (!anchorElementRef.current || filteredEnvVars.length === 0)
        return null

      return createPortal(
        <div className="bg-white rounded-md shadow-lg border border-gray-200 min-w-48 max-h-56 overflow-y-auto z-50">
          {groupedEnvVars.map((group, groupIndex) => {
            const globalBeginIndex = groupedEnvVars
              .slice(0, groupIndex)
              .reduce((acc, g) => acc + g.ext.options.length, 0)
            const handleClick = (option: VarOption) => {
              selectOptionAndCleanUp(option)
            }
            const handleMouseEnter = (_option: VarOption, index: number) => {
              setHighlightedIndex(globalBeginIndex + index)
            }

            return (
              <EnvVarSubMenu
                key={group.sourceId}
                title={group.ext.title}
                options={group.ext.options}
                selectedIndex={
                  selectedIndex === null
                    ? undefined
                    : selectedIndex - globalBeginIndex
                }
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
              />
            )
          })}
        </div>,
        anchorElementRef.current,
      )
    },
    [filteredEnvVars.length, groupedEnvVars],
  )

  return (
    <LexicalTypeaheadMenuPlugin<VarOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={filteredEnvVars}
      menuRenderFn={menuRenderFn}
    />
  )
}

export default EnvVarMenuPlugin
