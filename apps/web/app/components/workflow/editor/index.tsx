'use client'

import { ReactFlowProvider } from '@xyflow/react'
import { memo, useMemo } from 'react'
import { useAppParam } from '../hooks/use-app-param'
import StoreProvider from './providers/StoreProvider'
import EditorMainView from './EditorMainView'
import { useWorkflowAppDraftQuery } from '@/app/hooks/query/workflow/use-workflow-app-data-query'
import '@xyflow/react/dist/style.css'
import 'react-contexify/dist/ReactContexify.css'
import { initEdges, initNodes } from './utils/nodes'
import ExtStoreProvider from './providers/ExtStoreProvider'
import type { WorkflowExtStateStoreShape } from './hooks/use-workflow-ext-state'
import HistoryStoreProvider from './providers/HistoryStoreProvider'

const Editor = () => {
  const { appId } = useAppParam()
  const { data: remoteState } = useWorkflowAppDraftQuery(appId, {
    refetchInterval: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  })
  // 将draft的Nodes转换为WorkflowNodes之类的
  const remoteNodes = useMemo(
    () => (remoteState?.nodes ? initNodes(remoteState.nodes) : []),
    [remoteState],
  )
  const remoteEdges = useMemo(
    () => (remoteState?.edges ? initEdges(remoteState.edges) : []),
    [remoteState],
  )
  const remoteExtState = useMemo<Partial<WorkflowExtStateStoreShape>>(
    () => ({ envs: remoteState?.envs ?? [] }),
    [remoteState],
  )

  if (!remoteState) return <div>loading</div>
  return (
    <ReactFlowProvider>
      <StoreProvider>
        <ExtStoreProvider remoteExtState={remoteExtState}>
          <HistoryStoreProvider>
            <EditorMainView remoteNodes={remoteNodes} remoteEdges={remoteEdges} />
          </HistoryStoreProvider>
        </ExtStoreProvider>
      </StoreProvider>
    </ReactFlowProvider>
  )
}
export default memo(Editor)
