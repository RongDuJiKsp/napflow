import { jsonQ } from '@/utils/net'
import type { WorkflowAppDataType } from '@shared/data-transfer/workflow/base'
import { ReactFlowProvider } from '@xyflow/react'
import { useMount } from 'ahooks'
import type { PropsWithChildren } from 'react'
import { memo, useCallback, useState } from 'react'
import { useAppParam } from '../../hooks/use-app-param'

const EditorProvider = ({ children }: PropsWithChildren) => {
  const { appId } = useAppParam()
  const [remoteState, setRemoteState] = useState<WorkflowAppDataType | null>(null)

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
      {children}
    </ReactFlowProvider>
  )
}
export default memo(EditorProvider)
