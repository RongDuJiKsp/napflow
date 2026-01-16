import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { TriggerData } from './creator'

const TriggerPanel: ComponentPanelFc<TriggerData> = ({ node }) => {
  return (
    <div>
      Trigger
    </div>
  )
}
export default memo(TriggerPanel)
