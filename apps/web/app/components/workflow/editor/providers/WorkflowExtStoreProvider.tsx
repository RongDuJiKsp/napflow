import { useCreation } from 'ahooks'
import type { WorkflowExtStateStoreShape } from '../hooks/use-workflow-ext-state'
import {
  WorkflowExtStoreContext,
  createWorkflowExtStateStore,
} from '../hooks/use-workflow-ext-state'
import type { PropsWithChildren } from 'react'
import { memo, useEffect } from 'react'

const WorkflowExtStoreProvider = ({
  children,
  remoteExtState,
}: PropsWithChildren<{
  remoteExtState?: Partial<WorkflowExtStateStoreShape>;
}>) => {
  const extStore = useCreation(createWorkflowExtStateStore, [])
  useEffect(() => {
    if (remoteExtState)
      extStore.setState(remoteExtState)
  }, [extStore, remoteExtState])

  return (
    <WorkflowExtStoreContext.Provider value={extStore}>
      {children}
    </WorkflowExtStoreContext.Provider>
  )
}

export default memo(WorkflowExtStoreProvider)
