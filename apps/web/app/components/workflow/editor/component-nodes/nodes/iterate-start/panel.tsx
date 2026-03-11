import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { IterateStartData } from '@shared/common/workflow/node-data/iterate-start'
import ProviderEnv from '../../common/provider-env'
import { useIterateStartOutputVars } from './hooks/use-iterate-start-output-vars'

const IterateStartPanel: ComponentPanelFc<IterateStartData> = ({
  id,
  data,
}) => {
  const iterateStartVars = useIterateStartOutputVars(id)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <ProviderEnv envs={iterateStartVars} />
      </div>
    </div>
  )
}
export default memo(IterateStartPanel)
