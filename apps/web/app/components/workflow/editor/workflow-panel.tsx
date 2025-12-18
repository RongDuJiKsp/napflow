import { ReactFlow, ReactFlowProvider } from '@xyflow/react'
import type { WorkflowState } from './types'
import { memo, useCallback, useState } from 'react'
import { useMount } from 'ahooks'
import { useAppMeta } from './providers/hooks/use-app-meta'
import { jsonQ } from '@/utils/net'
import type { WorkflowAppDataType } from '@shared/data-transfer/workflow/base'

// core消费state
const WorkflowPanelCore = () => {
  return (
    <>
      <ReactFlow />
    </>
  )
}

// panel提供state
const WorkflowPanel = () => {
  const { appId } = useAppMeta()
  const [remoteState, setRemoteState] = useState<WorkflowState | null>(null)

  const loadRemoteState = useCallback(async () => {
    const data = await jsonQ.Get<WorkflowAppDataType>(`/workflow/${appId}/draft`)
    setRemoteState(data)
  }, [appId])

  useMount(async () => {
    await loadRemoteState()
  })

  if (!remoteState) return <div>loading</div>

  return (
    <ReactFlowProvider
      initialNodes={remoteState.nodes ?? []}
      initialEdges={remoteState.edges ?? []}
    >
      <WorkflowPanelCore />
    </ReactFlowProvider>
  )
}
export default memo(WorkflowPanel)
