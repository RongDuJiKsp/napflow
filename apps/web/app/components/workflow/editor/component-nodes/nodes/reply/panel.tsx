import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { ReplyData } from './creator'

const ReplyPanel: ComponentPanelFc<ReplyData> = ({ id, data }) => {
  return (
    <div>Reply Panel</div>
  )
}

export default memo(ReplyPanel)
