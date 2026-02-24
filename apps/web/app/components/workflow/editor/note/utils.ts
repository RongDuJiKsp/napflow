import { NodeClassic } from '@shared/common/workflow/core'
import { createWorkflowNode } from '../utils/nodes'
import type { NoteData } from './type'
import type { WorkflowNode } from '../types'

export const createNoteNode = (): WorkflowNode<NoteData> => {
  return createWorkflowNode<NoteData>({
    type: NodeClassic.Note,
    data: {
      content: '',
      _cacheKV: {},
      expanded: false,
    },
  })
}
