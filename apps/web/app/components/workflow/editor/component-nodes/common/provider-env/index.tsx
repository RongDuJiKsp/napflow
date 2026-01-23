import { memo } from 'react'
import type { Var } from '../../types'
import { VarTypes } from '../../types'
import { twMerge } from 'tailwind-merge'

const typeColors: Record<VarTypes, string> = {
  [VarTypes.String]: 'bg-blue-100 text-blue-700',
  [VarTypes.Number]: 'bg-green-100 text-green-700',
  [VarTypes.StringArray]: 'bg-purple-100 text-purple-700',
  [VarTypes.NumberArray]: 'bg-pink-100 text-pink-700',
}

const typeLabels: Record<VarTypes, string> = {
  [VarTypes.String]: 'String',
  [VarTypes.Number]: 'Number',
  [VarTypes.StringArray]: 'StringArray',
  [VarTypes.NumberArray]: 'NumberArray',
}

type ProviderEnvsProps = {
  envs: Var[];
}

const ProviderEnvs = memo(({ envs }: ProviderEnvsProps) => {
  if (!envs || envs.length === 0) return null

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-purple-700 mb-3">输出变量</h4>
      <div className="space-y-2">
        {envs.map((env, index) => (
          <div
            key={`${env.name}-${index}`}
            className="flex items-center justify-between px-2 py-1 bg-white rounded-lg border border-pink-200 shadow-sm"
          >
            <span className="text-sm font-medium text-gray-700">
              {env.name}
            </span>
            <span
              className={twMerge(
                'text-xs px-2 py-1 rounded-full font-medium w-18 text-center',
                typeColors[env.type],
              )}
            >
              {typeLabels[env.type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})

ProviderEnvs.displayName = 'ProviderEnvs'

export default ProviderEnvs
