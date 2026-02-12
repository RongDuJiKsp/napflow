import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import type { ReplyData } from '@shared/common/workflow/node-data/reply'

const ReplyNode: ComponentNodeFc<ReplyData> = ({ data }) => {
  return <div>Reply Extra</div>
}
export default memo(ReplyNode)
