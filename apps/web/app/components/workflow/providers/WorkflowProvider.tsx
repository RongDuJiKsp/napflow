'use client'

import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import type { AppParam } from '../hooks/use-app-param'
import { AppParamContext } from '../hooks/use-app-param'

const WorkflowProvider = ({
  children,
  appParam,
}: PropsWithChildren<{ appParam: AppParam }>) => {
  return (
    <AppParamContext.Provider value={appParam}>
      {children}
    </AppParamContext.Provider>
  )
}
export default memo(WorkflowProvider)
