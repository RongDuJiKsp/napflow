'use client'
import { Drawer } from 'antd'
import { memo } from 'react'
import { useStore } from 'zustand'
import { useEditorOutsideStore } from '../../hooks/use-editor-outside-store'

const WorkflowAgent = () => {
  const editorOutsideStore = useEditorOutsideStore()
  const isOpen = useStore(editorOutsideStore, state => state.isAgentWindowOpen)
  const close = useStore(editorOutsideStore, state => state.closeAgentWindow)

  return (
    <Drawer
      title="Agent"
      placement="left"
      size={'large'}
      open={isOpen}
      onClose={close}
      mask={false}
    >
      <div className="text-sm text-black/45">Agent 功能占位</div>
    </Drawer>
  )
}

export default memo(WorkflowAgent)
