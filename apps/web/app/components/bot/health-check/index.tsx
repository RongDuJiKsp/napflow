'use client'

import { memo } from 'react'
import NodeQueueArea from './NodeQueueArea'
import TaskQueueArea from './TaskQueueArea'

const BotHealthCheck = () => {
  return (
    <>
      <NodeQueueArea/>
      <TaskQueueArea/>
    </>
  )
}

export default memo(BotHealthCheck)
