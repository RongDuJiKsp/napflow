import { Dialog, DialogTitle } from '@headlessui/react'
import { useStore } from 'zustand'
import { useEditorOutsideStore } from '../hooks/use-editor-outside-store'
import { memo } from 'react'

const WorkflowEnvDialog = () => {
  const editorOutsideStore = useEditorOutsideStore()
  const isOpen = useStore(editorOutsideStore, state => state.isEnvWindowOpen)
  const close = useStore(editorOutsideStore, state => state.closeEnvWindow)

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>Workflow Env</DialogTitle>
    </Dialog>
  )
}

export default memo(WorkflowEnvDialog)
