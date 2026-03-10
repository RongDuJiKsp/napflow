import { useCallback } from 'react'
import type { ItemParams } from 'react-contexify'
import type { ComponentNodeProps } from '../../../types'
import { useComponentNodeOperations } from '../../../hooks/use-component-node-operations'
import { useWorkflowDraft } from '../../../../hooks/use-workflow-draft'
import { useComponentNodeCurd } from '../../../hooks/use-component-node-curd'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'

type HandlerProps = ItemParams<ComponentNodeProps>

export const useComponentNodeContextMenu = () => {
  const { getNode } = useComponentNodeCurd()
  const { handleDeleteNode, handleFoldUnfoldNode }
    = useComponentNodeOperations()
  const { submitSyncDraft } = useWorkflowDraft()

  const handleDeleteItem = useCallback(
    ({ props }: HandlerProps) => {
      const node = getNode(props?.id)
      if (!node) {
        console.warn(`删除了不存在的node${props?.id}`)
        return
      }
      handleDeleteNode(node)
      submitSyncDraft()
    },
    [handleDeleteNode, submitSyncDraft, getNode],
  )

  const handleFoldUnfoldItem = useCallback(
    ({ props }: HandlerProps) => {
      const node = getNode(props?.id)
      if (!node) {
        console.warn(`折叠了不存在的node${props?.id}`)
        return
      }
      handleFoldUnfoldNode(node)
      submitSyncDraft()
    },
    [handleFoldUnfoldNode, getNode, submitSyncDraft],
  )

  /** 判断右键的节点是否是容器节点 */
  const isContainerNode = useCallback(
    ({ props }: Omit<HandlerProps, 'event'>): boolean => {
      const node = getNode(props?.id)
      return [ComponentNodesEnum.Loop, ComponentNodesEnum.Iterate].includes(
        node?.data.type as ComponentNodesEnum,
      )
    },
    [getNode],
  )

  return {
    handleDeleteItem,
    handleFoldUnfoldItem,
    isContainerNode,
  }
}
