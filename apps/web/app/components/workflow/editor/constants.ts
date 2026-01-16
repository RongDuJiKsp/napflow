import { NodeClassic } from '@shared/common/workflow/core'
import ComponentNodesNode from './component-nodes/node'
import NoteNode from './note/node'

export const EDITOR_PANEL_ID = 'editor-panel'

export const nodeTypes = {
  [NodeClassic.Component]: ComponentNodesNode,
  [NodeClassic.Note]: NoteNode,
}
