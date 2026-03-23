'use client'
import { Button } from '@heroui/react'
import { RiRobot2Line } from '@remixicon/react'
import { memo } from 'react'
import { useStore } from 'zustand'
import { useEditorOutsideStore } from '../../hooks/use-editor-outside-store'

const WorkflowAgentButton = () => {
  const editorOutsideStore = useEditorOutsideStore()
  const open = useStore(editorOutsideStore, state => state.openAgentWindow)

  return (
    <Button onClick={open} variant="tertiary">
      <div className="flex items-center gap-2">
        <RiRobot2Line size={16} />
        <span>Agent</span>
      </div>
    </Button>
  )
}

export default memo(WorkflowAgentButton)
