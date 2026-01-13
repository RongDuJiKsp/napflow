import { memo } from 'react'
import type { WorkflowFc } from '../types'
import type { TriggerData } from './creator'

const TriggerPanel: WorkflowFc<TriggerData> = () => {
  return (
    <div>
      Trigger
    </div>
  )
}
export default memo(TriggerPanel)
