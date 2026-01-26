'use client'

import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import type { BotParam } from '../hooks/use-bot-param'
import { BotParamContext } from '../hooks/use-bot-param'
const WorkflowProvider = ({
  children,
  routerParam,
}: PropsWithChildren<{ routerParam: BotParam }>) => {
  return (
    <BotParamContext.Provider value={routerParam}>
      {children}
    </BotParamContext.Provider>
  )
}
export default memo(WorkflowProvider)
