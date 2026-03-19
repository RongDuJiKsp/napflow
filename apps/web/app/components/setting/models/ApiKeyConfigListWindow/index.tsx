'use client'
import { RiAddLine, RiBrainAi3Line, RiDeleteBin2Line, RiEditLine } from '@remixicon/react'
import { memo } from 'react'
import { Button } from '@heroui/react'
import SettingItemContainer from '@/app/components/_base/container/SettingItemContainer'
import { useApiKeyOperators } from '../hooks/use-api-key-operators'
import ApiKeyConfigFormDialog from './ApiKeyConfigFormDialog'
import { useApiKeyListQuery } from '@/app/hooks/query/agent/use-api-key-list-query'

const ApiKeyConfigListWindow = () => {
  const { data: configs = [] } = useApiKeyListQuery()
  const { editTarget, handleAddConfig, handleEditConfig, handleCloseModal, deleteConfig } = useApiKeyOperators()

  return (
    <SettingItemContainer
      title="已配置模型列表"
      Icon={RiBrainAi3Line}
      extra="OpenAI 协议"
    >
      <div className="mb-4 flex justify-end">
        <Button
          onClick={handleAddConfig}
          className="bg-linear-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-purple-600 hover:to-pink-600"
        >
          <RiAddLine className="mr-1 h-4 w-4" />
          添加模型配置
        </Button>
      </div>

      <div className="space-y-3">
        {configs.length === 0 && (
          <div className="rounded-xl border border-dashed border-pink-200 bg-white/70 p-4 text-sm text-pink-500">
            暂无配置，请点击右上角按钮添加模型配置。
          </div>
        )}

        {configs.map(config => (
          <div
            key={config.id}
            className="rounded-xl border border-pink-100 bg-white/90 p-4 shadow-sm"
          >
            <div className="mb-3 flex justify-end gap-2">
              <Button
                onClick={() => handleEditConfig(config.id)}
                className="h-8 min-w-0 rounded-lg bg-purple-100 px-3 text-sm text-purple-700 transition-colors duration-200 hover:bg-purple-200"
              >
                <RiEditLine className="mr-1 h-4 w-4" />
                编辑
              </Button>
              <Button
                onClick={() => deleteConfig(config.id)}
                className="h-8 min-w-0 rounded-lg bg-red-100 px-3 text-sm text-red-600 transition-colors duration-200 hover:bg-red-200"
              >
                <RiDeleteBin2Line className="mr-1 h-4 w-4" />
                删除
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <p className="mb-1 text-xs font-medium text-purple-500">端点</p>
                <p className="break-all text-sm text-gray-700">{config.endpoint}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-purple-500">API Key</p>
                <p className="break-all text-sm text-gray-700">{config.apiKey}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-purple-500">模型</p>
                <p className="text-sm text-gray-700">{config.model}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ApiKeyConfigFormDialog open={!!editTarget} editId={editTarget !== true ? editTarget : undefined} onClose={handleCloseModal} />
    </SettingItemContainer>
  )
}

export default memo(ApiKeyConfigListWindow)
