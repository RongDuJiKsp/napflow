import { memo, useMemo } from 'react'
import type { ComponentNodeFc } from '../../types'
import type { IfData } from '@shared/common/workflow/node-data/if'
import {
  BranchType,
  CompareOperatorLabels,
} from '@shared/common/workflow/node-data/if'
import { Handle, Position } from '@xyflow/react'

const IfNode: ComponentNodeFc<IfData> = ({ id, data }) => {
  const branches = data.branches

  // 为每个分支生成标签
  const branchLabels = useMemo(() => {
    return branches.map((branch) => {
      if (branch.type === BranchType.Else) return 'else'

      const prefix = branch.type === BranchType.If ? 'if' : 'else if'
      const cond = branch.condition
      if (!cond || !cond.variable) return `${prefix}: (未配置)`

      const operatorLabel
        = CompareOperatorLabels[cond.operator] || cond.operator
      const valueDisplay = cond.value || '?'
      return `${prefix}: ${cond.variable} ${operatorLabel} ${valueDisplay}`
    })
  }, [branches])

  return (
    <div className="flex flex-col gap-1 relative min-w-40">
      {branches.map((branch, index) => (
        <div
          key={branch.id}
          className="flex items-center justify-between gap-2 text-xs px-1 py-0.5 rounded bg-white/60 border border-pink-100"
        >
          <span className="truncate text-gray-600 max-w-36">
            {branchLabels[index]}
          </span>
          <Handle
            type="source"
            position={Position.Right}
            id={branch.id}
            style={{
              position: 'relative',
              top: 'auto',
              right: 'auto',
              transform: 'none',
            }}
            className="!w-2 !h-2 !bg-purple-400 !border-purple-600 shrink-0"
          />
        </div>
      ))}
    </div>
  )
}

export default memo(IfNode)
