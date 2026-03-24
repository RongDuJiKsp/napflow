import { useCallback, useState } from 'react'
import { useStore } from 'zustand'
import { useEditorOutsideStore } from '../../../hooks/use-editor-outside-store'
export enum AgentPanelStage {
  ModelSelection = 1,
  AgentChat = 2,
}

export const useWorkflowAgent = () => {
  const editorOutsideStore = useEditorOutsideStore()
  const isOpen = useStore(editorOutsideStore, state => state.isAgentWindowOpen)
  const close = useStore(editorOutsideStore, state => state.closeAgentWindow)
  const [panelStage, setPanelStage] = useState<AgentPanelStage>(AgentPanelStage.ModelSelection)
  const [selectedConfigId, setSelectedConfigId] = useState<string>()

  const handleClose = useCallback(() => {
    setPanelStage(AgentPanelStage.ModelSelection)
    setSelectedConfigId(undefined)
    close()
  }, [close])

  const handleEnterChat = useCallback(() => {
    if (!selectedConfigId)
      return
    setPanelStage(AgentPanelStage.AgentChat)
  }, [selectedConfigId])

  return {
    isOpen,
    handleClose,
    handleEnterChat,
    panelStage,
    selectedConfigId,
    setSelectedConfigId,
  }
}
