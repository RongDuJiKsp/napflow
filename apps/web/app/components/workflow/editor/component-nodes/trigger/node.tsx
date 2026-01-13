import { memo } from 'react'
import type { WorkflowFc } from '../types'
import { type TriggerData, TriggerOn } from './creator'

const TriggerNode: WorkflowFc<TriggerData> = ({ data }) => {
  return (
    <div>Trigger@{data.on}/{data.on === TriggerOn.Friend ? data.userId : data.groupId}</div>
  )
}
export default memo(TriggerNode)
