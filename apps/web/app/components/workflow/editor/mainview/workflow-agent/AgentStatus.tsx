import { Button } from '@heroui/react'
import {
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiSparkling2Line,
} from '@remixicon/react'
import { useAgentChatStatus } from './hooks/use-agent-chat-status'
import { useAgentChatEditor } from './hooks/use-agent-chat-editor'
import { useWorkflowHistory } from '../../hooks/use-workflow-history'

const AgentStatus = () => {
  const { isConnected } = useAgentChatStatus()
  const { undo, redo, canUndo, canRedo, title } = useWorkflowHistory()
  useAgentChatEditor()

  const historyTitle = title?.trim() || '（暂无标题）'

  return (
    <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-sky-50/50 p-4 shadow-xs">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-700">
          <RiSparkling2Line size={18} className="text-sky-500" />
          <span className="text-sm font-medium text-slate-700">
            Agent 对话
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${isConnected
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-300 bg-white text-slate-500'}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}
          />
          {isConnected ? '已连接' : '连接中'}
        </span>
      </div>
      <p className="text-xs text-slate-500">
        使用Agent快速生成工作流
      </p>

      <div className="mt-2 flex items-center gap-1.5 rounded-md bg-white/60 px-2 py-1 text-[11px] text-slate-500">
        <span className="shrink-0">历史:</span>
        <span className="min-w-0 truncate text-slate-700" title={historyTitle}>
          {historyTitle}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Button
          variant="tertiary"
          isDisabled={!canUndo}
          onPress={() => undo(1)}
          className="h-8 border border-slate-200 bg-white text-slate-700"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium">
            <RiArrowGoBackLine size={14} />
            撤销一步
          </span>
        </Button>
        <Button
          variant="tertiary"
          isDisabled={!canRedo}
          onPress={() => redo(1)}
          className="h-8 border border-slate-200 bg-white text-slate-700"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium">
            <RiArrowGoForwardLine size={14} />
            重做一步
          </span>
        </Button>
      </div>
    </div>
  )
}

export default AgentStatus
