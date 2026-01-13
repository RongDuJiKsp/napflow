'use client'

import { ReactFlowProvider } from '@xyflow/react'
import { memo, useMemo } from 'react'
import { useAppParam } from '../hooks/use-app-param'
import StoreProvider from './providers/StoreProvider'
import EditorMainView from './EditorMainView'
import { useWorkflowAppDataQuery } from '@/app/hooks/query/use-workflow-app-data-query'
import '@xyflow/react/dist/style.css'
import 'react-contexify/dist/ReactContexify.css'

const Editor = () => {
  const { appId } = useAppParam()
  const { data: remoteState } = useWorkflowAppDataQuery(appId)
  const remoteNodes = useMemo(() => remoteState?.nodes ?? [], [remoteState])
  const remoteEdges = useMemo(() => remoteState?.edges ?? [], [remoteState])
  if (!remoteState) return <div>loading</div>

  return (
    <ReactFlowProvider>
      <StoreProvider>
        <EditorMainView remoteNodes={remoteNodes} remoteEdges={remoteEdges} />
      </StoreProvider>
    </ReactFlowProvider>
  )
}
export default memo(Editor)
