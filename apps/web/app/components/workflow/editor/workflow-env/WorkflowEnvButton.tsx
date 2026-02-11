'use client'
import { Button } from '@heroui/react'
import { memo } from 'react'
import { useEditorOutsideStore } from '../hooks/use-editor-outside-store'
import { useStore } from 'zustand'

const WorkflowEnvButton = () => {
  const editorOutsideStore = useEditorOutsideStore()
  const open = useStore(editorOutsideStore, state => state.openEnvWindow)
  return <>
    <Button onClick={open} variant='tertiary'>
      ENV
    </Button>
  </>
}

export default memo(WorkflowEnvButton)
