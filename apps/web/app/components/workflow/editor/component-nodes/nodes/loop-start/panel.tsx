import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { LoopStartData } from '@shared/common/workflow/node-data/loop-start'
import ProviderEnv from '../../common/provider-env'

const LoopStartPanel: ComponentPanelFc<LoopStartData> = ({ id, data }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <ProviderEnv envs={data.vars} />
      </div>
    </div>
  )
}
export default memo(LoopStartPanel)
