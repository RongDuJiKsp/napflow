'use client'
import { Drawer } from 'antd'
import { RiRobot2Line } from '@remixicon/react'
import { memo } from 'react'
import AgentChatStep from './AgentChat'
import ModelSelectionStep from './AgentSelect'
import { AgentPanelStage, useWorkflowAgent } from './hooks/use-workflow-agent'
import { choose } from '@/utils/comm'

const WorkflowAgent = () => {
  const { isOpen, handleClose, handleEnterChat, panelStage, selectedConfigId, setSelectedConfigId } = useWorkflowAgent()
  const isModelSelection = panelStage === AgentPanelStage.ModelSelection
  const isAgentChat = panelStage === AgentPanelStage.AgentChat
  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 text-base">
          <RiRobot2Line size={18} />
          <span>{
            choose(
              isModelSelection && '创建 Agent',
              isAgentChat && 'Agent 对话',
            )}
          </span>
        </div>
      }
      placement="left"
      open={isOpen}
      onClose={handleClose}
      mask={false}
      closable={panelStage === AgentPanelStage.ModelSelection}
    >
      {panelStage === AgentPanelStage.ModelSelection && (
        <ModelSelectionStep
          selectedConfigId={selectedConfigId}
          setSelectedConfigId={setSelectedConfigId}
          onEnterChat={handleEnterChat}
        />
      )}

      {panelStage === AgentPanelStage.AgentChat
      && <AgentChatStep />}
    </Drawer>
  )
}

export default memo(WorkflowAgent)
