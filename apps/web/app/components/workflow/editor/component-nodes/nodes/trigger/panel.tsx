import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { TriggerData } from './creator'
import { useTriggerCurd } from './hooks/use-trigger-curd'

const TriggerPanel: ComponentPanelFc<TriggerData> = ({ node }) => {
  const {
    handleTriggerTargetChange,
    handleUserIdChange,
    handleGroupIdChange,
  } = useTriggerCurd(node)

  return (
    <div>
      Trigger
    </div>
  )
}
export default memo(TriggerPanel)
