import {
  safeAssertComponentNode,
  safeAssertWorkflowNodeAsComponentNode,
} from '@/app/components/workflow/editor/component-nodes/utils/node-asserts'
import type { ComponentNode } from '@/app/components/workflow/editor/component-nodes/types'
import type { WorkflowNode } from '@/app/components/workflow/editor/types'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { NodeClassic } from '@shared/common/workflow/core'
import { describe, expect, test } from 'vitest'

const createComponentNode = (type: ComponentNodesEnum): ComponentNode => {
  return {
    id: `${type}-component-node`,
    data: {
      type,
    },
  } as ComponentNode
}

const createWorkflowNode = (
  nodeType: NodeClassic,
  componentType: ComponentNodesEnum,
): WorkflowNode => {
  return {
    id: `${nodeType}-workflow-node`,
    type: nodeType,
    data: {
      type: componentType,
    },
  } as ComponentNode as WorkflowNode
}

describe('component node asserts', () => {
  test('safeAssertComponentNode: node 为空时返回 null', () => {
    expect(
      safeAssertComponentNode(ComponentNodesEnum.Trigger, undefined),
    ).toBeNull()
  })

  test('safeAssertComponentNode: data.type 不匹配时返回 null', () => {
    const replyNode = createComponentNode(ComponentNodesEnum.Reply)
    expect(
      safeAssertComponentNode(ComponentNodesEnum.Trigger, replyNode),
    ).toBeNull()
  })

  test('safeAssertComponentNode: data.type 匹配时返回原节点', () => {
    const triggerNode = createComponentNode(ComponentNodesEnum.Trigger)
    expect(
      safeAssertComponentNode(ComponentNodesEnum.Trigger, triggerNode),
    ).toBe(triggerNode)
  })

  test('safeAssertWorkflowNodeAsComponentNode: 非组件节点返回 null', () => {
    const noteWorkflowNode = createWorkflowNode(
      NodeClassic.Note,
      ComponentNodesEnum.Trigger,
    )
    expect(
      safeAssertWorkflowNodeAsComponentNode(
        ComponentNodesEnum.Trigger,
        noteWorkflowNode,
      ),
    ).toBeNull()
  })

  test('safeAssertWorkflowNodeAsComponentNode: 组件节点但 component type 不匹配返回 null', () => {
    const componentWorkflowNode = createWorkflowNode(
      NodeClassic.Component,
      ComponentNodesEnum.Reply,
    )
    expect(
      safeAssertWorkflowNodeAsComponentNode(
        ComponentNodesEnum.Trigger,
        componentWorkflowNode,
      ),
    ).toBeNull()
  })

  test('safeAssertWorkflowNodeAsComponentNode: 组件节点且 component type 匹配时返回原节点', () => {
    const componentWorkflowNode = createWorkflowNode(
      NodeClassic.Component,
      ComponentNodesEnum.Trigger,
    )
    expect(
      safeAssertWorkflowNodeAsComponentNode(
        ComponentNodesEnum.Trigger,
        componentWorkflowNode,
      ),
    ).toBe(componentWorkflowNode)
  })
})
