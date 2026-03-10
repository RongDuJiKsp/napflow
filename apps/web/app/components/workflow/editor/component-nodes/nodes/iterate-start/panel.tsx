import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { IterateStartData } from '@shared/common/workflow/node-data/iterate-start'
import ProviderEnv from '../../common/provider-env'
import { useComponentNodeEnv } from '../../hooks/use-component-node-env'
import { getIterateStartOutputVars } from '../../hooks/use-component-node-env'
import { useReactFlow } from '@xyflow/react'
import type { ComponentNode } from '../../types'
import type { WorkflowEdge, WorkflowNode } from '../../../types'

const IterateStartPanel: ComponentPanelFc<IterateStartData> = ({ id, data }) => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const { localVars } = useComponentNodeEnv(id)
  const currentNode = reactflow.getNode(id) as ComponentNode | undefined
  const parentNode = currentNode?.parentId
    ? (reactflow.getNode(currentNode.parentId) as ComponentNode | undefined)
    : undefined
  const sourceVarName
    = (parentNode?.data as { sourceVarName?: string } | undefined)?.sourceVarName
  const iterateVars = getIterateStartOutputVars(
    sourceVarName,
    localVars,
    data.vars,
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <ProviderEnv envs={iterateVars} />
      </div>
    </div>
  )
}
export default memo(IterateStartPanel)
