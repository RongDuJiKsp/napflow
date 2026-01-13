import { memo } from 'react'
import type { WorkflowFc } from '../component-nodes/types'
import type { NoteData } from './type'

const NoteNode: WorkflowFc<NoteData> = ({ data }) => {
  return (<div>
    {data.content}
  </div>)
}
export default memo(NoteNode)
