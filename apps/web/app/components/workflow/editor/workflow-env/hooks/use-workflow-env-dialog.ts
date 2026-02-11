import { useStore } from 'zustand'
import { useEditorOutsideStore } from '../../hooks/use-editor-outside-store'
import { useWorkflowExtStore } from '../../hooks/use-workflow-ext-state'

export const useWorkflowEnvDialog = () => {
  const editorOutsideStore = useEditorOutsideStore()
  const isOpen = useStore(editorOutsideStore, state => state.isEnvWindowOpen)
  const close = useStore(editorOutsideStore, state => state.closeEnvWindow)
  const workflowExtStore = useWorkflowExtStore()
  const envs = useStore(workflowExtStore, state => state.envs)
  const addEnv = useStore(workflowExtStore, state => state.addEnv)
  const deleteEnv = useStore(workflowExtStore, state => state.removeEnvByIndex)
  return {
    isOpen,
    close,
    envs,
    addEnv,
    deleteEnv,
  }
}
