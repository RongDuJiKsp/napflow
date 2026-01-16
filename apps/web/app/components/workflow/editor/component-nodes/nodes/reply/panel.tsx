import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import type { ReplyData } from './creator'

const ReplyPanel: ComponentNodeFc<ReplyData> = ({ data }) => {
  return (
    <div>Reply Panel</div>
  )
}

export default memo(ReplyPanel)
