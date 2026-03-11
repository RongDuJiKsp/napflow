import { NodeClassic } from '@shared/common/workflow/core'
import { createWorkflowNode } from '../utils/nodes'
import type { NoteData, NoteNode } from './type'

export const createNoteNode = (): NoteNode => {
  return createWorkflowNode<NoteData>({
    type: NodeClassic.Note,
    data: {
      content: '',
      _cacheKV: {},
      expanded: false,
    },
  })
}
