'use client'
import { Drawer } from 'antd'
import { RiRobot2Line } from '@remixicon/react'
import { memo } from 'react'
import AgentChatStep from './AgentChat'
import ModelSelectionStep from './AgentSelect'
import { AgentPanelStage, useWorkflowAgent } from './hooks/use-workflow-agent'
import { choose } from '@/utils/comm'

const WorkflowAgent = () => {
  const {
    isOpen,
    handleClose,
    handleEnterChat,
    panelStage,
    connToken,
    setConnToken,
  } = useWorkflowAgent()
  const isModelSelection = panelStage === AgentPanelStage.ModelSelection
  const isAgentChat = panelStage === AgentPanelStage.AgentChat
  const isReadyForChat = Boolean(connToken)

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 text-base">
          <RiRobot2Line size={18} />
          <span>
            {choose(
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
      closable={isModelSelection}
      destroyOnHidden
    >
      {isModelSelection && (
        <ModelSelectionStep
          onConnTokenChange={setConnToken}
          onEnterChat={handleEnterChat}
        />
      )}
      {isAgentChat && isReadyForChat && (
        <AgentChatStep connToken={connToken} onInterrupt={handleClose} />
      )}
      {isAgentChat && !isReadyForChat && (
        <div className="flex h-full items-center justify-center">
          <span className="text-sm text-gray-500">
            未找到模型配置，请返回上一步重新选择模型
          </span>
        </div>
      )}
    </Drawer>
  )
}

export default memo(WorkflowAgent)
