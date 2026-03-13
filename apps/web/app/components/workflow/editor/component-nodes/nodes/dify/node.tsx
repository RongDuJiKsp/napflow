import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import type { DifyData } from '@shared/common/workflow/node-data/dify'
import InputWithEnv from '../../common/input-with-env'
import { useComponentNodeEnv } from '../../hooks/use-component-node-env'
import { noop } from 'lodash-es'

const DifyNode: ComponentNodeFc<DifyData> = ({ id, data }) => {
  const { vars } = useComponentNodeEnv(id)

  return (
    <div className="flex flex-col gap-1 relative min-w-40">
      <div className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded bg-white/60 border border-sky-100">
        <span className="text-sky-500 font-medium">API 地址</span>
        <span className="truncate text-gray-500 max-w-28">
          {data.baseUrl || <span className="text-gray-400 italic">未填写</span>}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 text-xs px-2 py-1 rounded bg-white/60 border border-sky-100">
        <span className="text-sky-500 font-medium">请求内容</span>
        {data.query ? (
          <div className="max-h-16 overflow-hidden text-gray-500">
            <InputWithEnv
              envs={vars}
              value={data.query}
              onChange={noop}
              isEditable={false}
              className={{
                contentEditable:
                  'text-xs text-gray-500 leading-tight outline-none',
              }}
            />
          </div>
        ) : (
          <span className="text-gray-400 italic">未填写</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded bg-white/60 border border-sky-100">
        <span className="text-sky-500 font-medium">输出变量</span>
        <span className="truncate text-gray-500 max-w-28">output</span>
      </div>
    </div>
  )
}

export default memo(DifyNode)
