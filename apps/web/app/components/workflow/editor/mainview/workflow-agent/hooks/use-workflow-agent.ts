import { useCallback, useState } from 'react'
import { useStore } from 'zustand'
import { useEditorOutsideStore } from '@workflow/editor/hooks/use-editor-outside-store'
export enum AgentPanelStage {
  ModelSelection = 1,
  AgentChat = 2,
}

export const useWorkflowAgent = () => {
  const editorOutsideStore = useEditorOutsideStore()
  const isOpen = useStore(
    editorOutsideStore,
    state => state.isAgentWindowOpen,
  )
  const close = useStore(editorOutsideStore, state => state.closeAgentWindow)
  const [panelStage, setPanelStage] = useState<AgentPanelStage>(
    AgentPanelStage.ModelSelection,
  )
  const [connToken, setConnToken] = useState<string>('')

  const handleClose = useCallback(() => {
    setPanelStage(AgentPanelStage.ModelSelection)
    setConnToken('')
    close()
  }, [close])

  const handleEnterChat = useCallback(() => {
    if (!connToken) return
    setPanelStage(AgentPanelStage.AgentChat)
  }, [connToken])

  return {
    isOpen,
    handleClose,
    handleEnterChat,
    panelStage,
    connToken,
    setConnToken,
  }
}
