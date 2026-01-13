import { NodeClassic } from '@shared/common/workflow/core'
import ComponentNodesNode from './component-nodes/node'
import NoteNode from './note/node'
import type { WorkflowComponent } from './component-nodes/types'

export const EDITOR_PANEL_ID = 'editor-panel'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nodeTypes: Record<NodeClassic, WorkflowComponent<any>> = {
  [NodeClassic.Component]: ComponentNodesNode,
  [NodeClassic.Note]: NoteNode,
}
