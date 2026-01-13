'use client'
import { memo } from 'react'
import EditorProvider from './providers/EditorProvider'
import WorkflowView from './mainview/workflow-view'
import NodeEditPanel from './mainview/node-edit-panel'

const Editor = () => {
  return <EditorProvider>
    <div id='editor-root' className='h-full'>
      <NodeEditPanel/>
      <WorkflowView/>
    </div>
  </EditorProvider>
}
export default memo(Editor)
