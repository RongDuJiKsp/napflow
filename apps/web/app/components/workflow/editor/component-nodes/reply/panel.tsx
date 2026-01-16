import { memo } from 'react'
import type { WorkflowFc } from '../types'
import type { ReplyData } from './creator'

const ReplyPanel: WorkflowFc<ReplyData> = ({ data }) => {
  return (
    <div>Reply Panel</div>
  )
}

export default memo(ReplyPanel)
