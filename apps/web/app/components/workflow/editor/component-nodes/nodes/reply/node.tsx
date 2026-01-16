import { memo } from 'react'
import type { WorkflowFc } from '../../types'
import type { ReplyData } from './creator'

const ReplyNode: WorkflowFc<ReplyData> = ({ data }) => {
  return (
    <div>Reply Extra</div>
  )
}
export default memo(ReplyNode)
