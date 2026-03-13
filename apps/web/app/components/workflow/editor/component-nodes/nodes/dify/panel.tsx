import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { DifyData } from '@shared/common/workflow/node-data/dify'
import { Label, ListBox, Select } from '@heroui/react'
import InputWithEnv from '../../common/input-with-env'
import { useDifyCurd } from './hooks/use-dify-curd'
import { DifyMode } from '@shared/common/workflow/node-data/dify'

const DifyPanel: ComponentPanelFc<DifyData> = ({ id, data }) => {
  const {
    vars,
    handleBaseUrlChange,
    handleApiKeyChange,
    handleQueryChange,
    handleModeChange,
    handleInputAdd,
    handleInputRemove,
    handleInputKeyChange,
    handleInputValueChange,
  } = useDifyCurd(id)

  return (
    <div className="flex flex-col gap-3">
      {/* ─── 模式选择 ─── */}
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-sky-600 text-xs font-semibold tracking-wide">
            应用类型
          </Label>
          <Select
            value={data.mode}
            onChange={v => handleModeChange(v as DifyMode)}
          >
            <Select.Trigger className="border-sky-200 hover:border-sky-400 transition-colors rounded-lg">
              <Select.Value />
            </Select.Trigger>
            <Select.Popover className="min-w-48">
              <ListBox>
                <ListBox.Item id={DifyMode.Chatflow} className="px-2 py-1.5 cursor-pointer hover:bg-sky-50 transition-colors">
                  <span className="text-sm">💬 Chatflow</span>
                </ListBox.Item>
                <ListBox.Item id={DifyMode.Workflow} className="px-2 py-1.5 cursor-pointer hover:bg-sky-50 transition-colors">
                  <span className="text-sm">⚙️ Workflow</span>
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

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
            placeholder="例如：https://api.dify.ai/v1，输入 $ 引用变量"
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

      {/* ─── Chatflow: 请求内容 ─── */}
      {data.mode === DifyMode.Chatflow && (
        <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1">
            <Label className="text-sky-600 text-xs font-semibold tracking-wide">
              请求内容
            </Label>
            <InputWithEnv
              envs={vars}
              value={data.query ?? ''}
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
      )}

      {/* ─── Workflow: 输入变量列表 ─── */}
      {data.mode === DifyMode.Workflow && (
        <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <Label className="text-sky-600 text-xs font-semibold tracking-wide">输入变量</Label>
            <button
              onClick={handleInputAdd}
              className="text-xs text-sky-500 hover:text-sky-700 font-medium"
            >
              + 添加
            </button>
          </div>
          {(data.inputs ?? []).length === 0 && (
            <span className="text-xs text-gray-400 italic">暂无输入变量</span>
          )}
          {(data.inputs ?? []).map((entry, index) => (
            <div key={index} className="flex gap-1 items-center">
              <input
                value={entry.key}
                onChange={e => handleInputKeyChange(index, e.target.value)}
                placeholder="字段名"
                className="text-xs border border-sky-200 rounded p-1.5 w-24 shrink-0 outline-none focus:border-sky-400"
              />
              <div className="flex-1">
                <InputWithEnv
                  envs={vars}
                  value={entry.value}
                  onChange={v => handleInputValueChange(index, v)}
                  placeholder="值，输入 $ 引用变量"
                  className={{
                    contentEditable: 'text-xs border border-sky-200 rounded p-1.5 w-full outline-none focus:border-sky-400',
                    placeHolder: 'text-gray-300',
                  }}
                />
              </div>
              <button
                onClick={() => handleInputRemove(index)}
                className="text-gray-300 hover:text-red-400 text-xs shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default memo(DifyPanel)
