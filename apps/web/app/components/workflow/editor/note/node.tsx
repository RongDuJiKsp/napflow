import { memo } from 'react'
import type { NoteData } from './type'
import type { WorkflowFc } from '../types'

const NoteNode: WorkflowFc<NoteData> = ({ data }) => {
  return (<div>
    {data.content}
  </div>)
}
export default memo(NoteNode)
