import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import type { ReplyData } from './creator'

const ReplyNode: ComponentNodeFc<ReplyData> = ({ data }) => {
  return <div>Reply Extra</div>
}
export default memo(ReplyNode)
