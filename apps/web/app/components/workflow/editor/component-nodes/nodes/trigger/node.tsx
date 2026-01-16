import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import { type TriggerData, TriggerOn } from './creator'

const TriggerNode: ComponentNodeFc<TriggerData> = ({ data }) => {
  return (
    <div>Trigger@{data.on}/{data.on === TriggerOn.Friend ? data.userId : data.groupId}</div>
  )
}
export default memo(TriggerNode)
