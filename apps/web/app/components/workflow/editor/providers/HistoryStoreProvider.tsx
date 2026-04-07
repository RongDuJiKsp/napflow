import { useCreation } from 'ahooks'
import type { WorkflowHistoryStateStoreShape } from '../hooks/use-workflow-history-store'
import {
  WorkflowHistoryStoreContext, createWorkflowHistoryStore,
} from '../hooks/use-workflow-history-store'
import type { PropsWithChildren } from 'react'
import { memo } from 'react'

const HistoryStoreProvider = ({
  children,
}: PropsWithChildren<{
  remoteHistoryState?: Partial<WorkflowHistoryStateStoreShape>;
}>) => {
  const historyStore = useCreation(createWorkflowHistoryStore, [])

  return (
    <WorkflowHistoryStoreContext.Provider value={historyStore}>
      {children}
    </WorkflowHistoryStoreContext.Provider>
  )
}

export default memo(HistoryStoreProvider)
