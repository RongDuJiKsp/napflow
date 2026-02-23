import { useCallback } from 'react'
import { useComponentNodeEnv } from '../../../hooks/use-component-node-env'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import {
  type Branch,
  BranchType,
  CompareOperator,
  type Condition,
  type IfData,
} from '@shared/common/workflow/node-data/if'
import { generateBranchId } from '../creator'

export const useIfCurd = (id: string) => {
  const { vars } = useComponentNodeEnv(id)
  const { editNode } = useStoreImmerCurd()

  // 更新某个分支的条件
  const handleConditionChange = useCallback(
    (branchId: string, field: keyof Condition, value: string) => {
      editNode<ComponentNode<IfData>>(id, (draft) => {
        const branch = draft.data.branches.find(b => b.id === branchId)
        if (branch && branch.condition) {
          if (field === 'operator')
            branch.condition.operator = value as CompareOperator
          else branch.condition[field] = value
        }
      })
    },
    [id, editNode],
  )

  // 添加else if分支
  const handleAddElseIf = useCallback(() => {
    editNode<ComponentNode<IfData>>(id, (draft) => {
      const newBranch: Branch = {
        id: generateBranchId(),
        type: BranchType.ElseIf,
        condition: {
          variable: '',
          operator: CompareOperator.StringEqual,
          value: '',
        },
      }
      // 在else之前插入，如果有else的话
      const elseIndex = draft.data.branches.findIndex(
        b => b.type === BranchType.Else,
      )
      if (elseIndex >= 0) draft.data.branches.splice(elseIndex, 0, newBranch)
      else draft.data.branches.push(newBranch)
    })
  }, [id, editNode])

  // 添加else分支
  const handleAddElse = useCallback(() => {
    editNode<ComponentNode<IfData>>(id, (draft) => {
      // 如果已经有else了就不再添加
      const hasElse = draft.data.branches.some(
        b => b.type === BranchType.Else,
      )
      if (hasElse) return
      draft.data.branches.push({
        id: generateBranchId(),
        type: BranchType.Else,
      })
    })
  }, [id, editNode])

  // 删除分支（不能删除第一个if分支）
  const handleRemoveBranch = useCallback(
    (branchId: string) => {
      editNode<ComponentNode<IfData>>(id, (draft) => {
        const index = draft.data.branches.findIndex(b => b.id === branchId)
        // 不能删除第一个if分支
        if (index <= 0) return
        draft.data.branches.splice(index, 1)
      })
    },
    [id, editNode],
  )

  // 检查是否已有else分支
  const hasElse = useCallback(
    (branches: Branch[]) => branches.some(b => b.type === BranchType.Else),
    [],
  )

  return {
    vars,
    handleConditionChange,
    handleAddElseIf,
    handleAddElse,
    handleRemoveBranch,
    hasElse,
  }
}
