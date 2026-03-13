import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { DifyData } from '@shared/common/workflow/node-data/dify'
import { Label } from '@heroui/react'
import InputWithEnv from '../../common/input-with-env'
import { useDifyCurd } from './hooks/use-dify-curd'

const DifyPanel: ComponentPanelFc<DifyData> = ({ id, data }) => {
  const {
    vars,
    handleBaseUrlChange,
    handleApiKeyChange,
    handleQueryChange,
  } = useDifyCurd(id)

  return (
    <div className="flex flex-col gap-3">
      {/* ─── API 地址 ─── */}
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-sky-600 text-xs font-semibold tracking-wide">
            Dify API 地址
          </Label>
          <InputWithEnv
            envs={vars}
            value={data.baseUrl}
            onChange={handleBaseUrlChange}
            placeholder="例如：https://api.dify.ai，输入 $ 引用变量"
            className={{
              contentEditable:
                'text-sm border border-sky-200 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-200 p-2 transition-all',
              placeHolder: 'text-gray-300',
            }}
          />
        </div>
      </div>

      {/* ─── API Key ─── */}
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-sky-600 text-xs font-semibold tracking-wide">
            API Key
          </Label>
          <InputWithEnv
            envs={vars}
            value={data.apiKey}
            onChange={handleApiKeyChange}
            placeholder="app-xxxxxxxxxxxxxxxx，输入 $ 引用变量"
            className={{
              contentEditable:
                'text-sm border border-sky-200 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-200 p-2 transition-all',
              placeHolder: 'text-gray-300',
            }}
          />
        </div>
      </div>

      {/* ─── 请求内容 ─── */}
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-sky-600 text-xs font-semibold tracking-wide">
            请求内容
          </Label>
          <InputWithEnv
            envs={vars}
            value={data.query}
            onChange={handleQueryChange}
            placeholder="输入问题内容，输入 $ 引用变量"
            className={{
              contentEditable:
                'text-sm border border-sky-200 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-200 p-2 transition-all',
              placeHolder: 'text-gray-300',
            }}
          />
        </div>
      </div>

    </div>
  )
}

export default memo(DifyPanel)
