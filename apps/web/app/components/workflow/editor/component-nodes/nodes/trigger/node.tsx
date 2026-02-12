import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import { TriggerOn } from '@shared/common/workflow/node-data/trigger'
import type { TriggerData } from '@shared/common/workflow/node-data/trigger'

const TriggerNode: ComponentNodeFc<TriggerData> = ({ data }) => {
  return (
    <div>
      Trigger@{data.on}/
      {data.on === TriggerOn.Friend ? data.userId : data.groupId}
    </div>
  )
}
export default memo(TriggerNode)
