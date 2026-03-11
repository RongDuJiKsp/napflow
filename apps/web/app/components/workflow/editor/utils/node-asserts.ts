import { NodeClassic } from '@shared/common/workflow/core'
import type { ComponentNode } from '../component-nodes/types'
import type { WorkflowNode } from '../types'
import type { NoteNode } from '../note/type'

export type NodeTypeForEnum = {
  [NodeClassic.Component]: ComponentNode,
  [NodeClassic.Note]: NoteNode,
}

export const safeAssertWorkflowNode = <E extends NodeClassic>(type: E, node?: WorkflowNode): NodeTypeForEnum[E] | null => {
  if(!node || node.type !== type) return null
  return node as NodeTypeForEnum[E]
}

export const safeAssertIsComponentNode = (node?: WorkflowNode): ComponentNode | null => {
  return safeAssertWorkflowNode(NodeClassic.Component, node)
}

export const safeAssertIsNoteNode = (node?: WorkflowNode): NoteNode | null => {
  return safeAssertWorkflowNode(NodeClassic.Note, node)
}
