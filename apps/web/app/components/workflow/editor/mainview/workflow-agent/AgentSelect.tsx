'use client'
import { Alert, Button, Select, Typography } from 'antd'
import { RiSparkling2Line } from '@remixicon/react'
import { memo, useEffect } from 'react'
import { useModelSelection } from './hooks/use-model-selection'
import { AgentWsConnType, serdeConnToken } from './hooks/use-agent-ws-conn'

type ModelSelectionStepProps = {
  onEnterChat: () => void;
  onConnTokenChange: (value: string) => void;
}

const AgentSelect = ({
  onEnterChat,
  onConnTokenChange,
}: ModelSelectionStepProps) => {
  const { isApiKeyListError, apiKeyListError, isApiKeyListPending, selectedConfigId, selectedModelConfig, modelOptions, findApiKeyItem, setSelectedConfigId } = useModelSelection()
  useEffect(() => {
    if (selectedConfigId)
      onConnTokenChange(serdeConnToken(AgentWsConnType.NewConnection, selectedConfigId))
  }, [selectedConfigId, onConnTokenChange])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-2xl border border-sky-100 bg-linear-to-br from-sky-50 to-cyan-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-700">
            <RiSparkling2Line size={18} />
            <Typography.Title level={5} className="m-0! text-sky-700!">
              选择执行模型
            </Typography.Title>
          </div>
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-sky-700">
            步骤 1/2
          </span>
        </div>
        <Typography.Text type="secondary">
          请选择一个可用模型，作为当前工作流中 Agent 的默认执行模型。
        </Typography.Text>
      </div>

      {isApiKeyListError && (
        <Alert
          type="error"
          showIcon
          message="加载模型列表失败"
          description={apiKeyListError instanceof Error ? apiKeyListError.message : '请稍后重试'}
        />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <Typography.Text className="mb-2 block text-sm font-medium text-gray-700">
          模型
        </Typography.Text>
        <Select
          className="w-full"
          placeholder={isApiKeyListPending ? '模型列表加载中...' : '请选择模型'}
          loading={isApiKeyListPending}
          options={modelOptions}
          value={selectedConfigId}
          onChange={setSelectedConfigId}
          disabled={isApiKeyListPending || modelOptions.length === 0}
          optionRender={(option) => {
            const config = findApiKeyItem(option.data.value)
            return (
              <div className="py-1">
                <div className="text-sm font-medium text-gray-800">{config?.model}</div>
                <div className="text-xs text-gray-400">{config?.endpoint}</div>
                <div className="text-xs text-gray-400">{config?.apiKey}</div>
              </div>
            )
          }}
        />
      </div>

      {selectedModelConfig && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <Typography.Text className="mb-2 block text-xs font-medium uppercase tracking-wide text-emerald-600">
            已选择模型
          </Typography.Text>
          <div className="text-sm font-semibold text-emerald-800">
            {selectedModelConfig.model}
          </div>
          <div className="mt-1 break-all text-xs text-emerald-700/80">
            {selectedModelConfig.endpoint}
          </div>
          <div className="mt-1 break-all text-xs text-emerald-700/80">
            {selectedModelConfig.apiKey}
          </div>
        </div>
      )}

      {!isApiKeyListPending && !isApiKeyListError && modelOptions.length === 0 && (
        <Alert
          type="info"
          showIcon
          message="当前没有可用模型配置"
          description="请先在设置页添加模型配置后再使用 Agent。"
        />
      )}

      <div className="mt-auto flex justify-end">
        <Button
          type="primary"
          onClick={onEnterChat}
          disabled={!selectedConfigId}
          size="large"
        >
          开始对话
        </Button>
      </div>
    </div>
  )
}

export default memo(AgentSelect)
