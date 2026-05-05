import { memo } from 'react'
import type { ComponentNodeFc } from '../../types'
import type { CodeEvalData } from '@shared/common/workflow/node-data/code-eval'
import InputWithEnv from '../../common/input-with-env'
import { useComponentNodeEnv } from '../../hooks/use-component-node-env'
import { noop } from 'lodash-es'
import { VarTypes } from '@shared/common/workflow/core/component-node'

const CodeEvalNode: ComponentNodeFc<CodeEvalData> = ({ id, data }) => {
  const { vars } = useComponentNodeEnv(id)
  const args = data.args || []
  const previewArgs = args.slice(0, 2)
  const hasMoreArgs = args.length > previewArgs.length

  return (
    <div className="flex flex-col gap-1 relative min-w-40">
      <div className="flex flex-col gap-0.5 text-xs px-2 py-1 rounded bg-white/60 border border-sky-100">
        <span className="text-purple-500 font-medium">参数</span>
        {args.length === 0 ? (
          <span className="text-gray-400 italic">无</span>
        ) : (
          <div className="flex flex-col gap-0.5">
            {previewArgs.map((arg, index) => {
              const type = arg.transJsValueType || VarTypes.String
              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2"
                >
                  {arg.kvTarget ? (
                    <div className="max-h-8 overflow-hidden text-gray-500 min-w-0 flex-1">
                      <InputWithEnv
                        envs={vars}
                        value={arg.kvTarget}
                        onChange={noop}
                        isEditable={false}
                        className={{
                          contentEditable:
                            'text-xs text-gray-500 leading-tight outline-none',
                        }}
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400 italic truncate min-w-0 flex-1">
                      未填写
                    </span>
                  )}
                  <span className="text-xs text-gray-400 shrink-0 truncate max-w-24">
                    {type}
                  </span>
                </div>
              )
            })}
            {hasMoreArgs && (
              <span className="text-gray-400 italic">
                … 共 {args.length} 个
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(CodeEvalNode)
