import {
  safeAssertIsComponentNode,
  safeAssertIsNoteNode,
  safeAssertWorkflowNode,
} from '@/app/components/workflow/editor/utils/node-asserts'
import type { WorkflowNode } from '@/app/components/workflow/editor/types'
import { NodeClassic } from '@shared/common/workflow/core'
import { describe, expect, test } from 'vitest'

const createWorkflowNode = (type: NodeClassic): WorkflowNode => {
  return {
    id: `${type}-node`,
    type,
  } as WorkflowNode
}

describe('workflow node asserts', () => {
  test('safeAssertWorkflowNode: node 为空时返回 null', () => {
    expect(safeAssertWorkflowNode(NodeClassic.Component, undefined)).toBeNull()
  })

  test('safeAssertWorkflowNode: type 不匹配时返回 null', () => {
    const noteNode = createWorkflowNode(NodeClassic.Note)
    expect(safeAssertWorkflowNode(NodeClassic.Component, noteNode)).toBeNull()
  })

  test('safeAssertWorkflowNode: type 匹配时返回原节点', () => {
    const componentNode = createWorkflowNode(NodeClassic.Component)
    expect(safeAssertWorkflowNode(NodeClassic.Component, componentNode)).toBe(componentNode)
  })

  test('safeAssertIsComponentNode: 仅在组件节点时返回节点', () => {
    const componentNode = createWorkflowNode(NodeClassic.Component)
    const noteNode = createWorkflowNode(NodeClassic.Note)

    expect(safeAssertIsComponentNode(componentNode)).toBe(componentNode)
    expect(safeAssertIsComponentNode(noteNode)).toBeNull()
  })

  test('safeAssertIsNoteNode: 仅在注释节点时返回节点', () => {
    const componentNode = createWorkflowNode(NodeClassic.Component)
    const noteNode = createWorkflowNode(NodeClassic.Note)

    expect(safeAssertIsNoteNode(noteNode)).toBe(noteNode)
    expect(safeAssertIsNoteNode(componentNode)).toBeNull()
  })
})
