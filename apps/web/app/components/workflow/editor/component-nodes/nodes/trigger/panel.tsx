import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import type { TriggerData } from './creator'

const TriggerPanel: ComponentNodeFc<TriggerData> = () => {
  return (
    <div>
      Trigger
    </div>
  )
}
export default memo(TriggerPanel)
