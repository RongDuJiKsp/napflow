'use client'
import { memo } from 'react'
import EditorProvider from './providers/EditorProvider'
import WorkflowView from './mainview/workflow-view'
import NodeEditPanel from './mainview/node-edit-panel'

const Editor = () => {
  return <EditorProvider>
    <div className='relative'>
      <NodeEditPanel/>
      <WorkflowView/>
    </div>
  </EditorProvider>
}
export default memo(Editor)
