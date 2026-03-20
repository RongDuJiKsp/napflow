'use client'

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { RiAddLine, RiCloseLine, RiEditLine } from '@remixicon/react'
import { Button, Input, Label, TextField } from '@heroui/react'
import { memo, useCallback, useState } from 'react'
import { useApiKeyConfigForm } from '../hooks/use-api-key-config-form'

type ApiKeyConfigFormDialogProps = {
  open: boolean;
  editId?: string;
  onClose: () => void;
}

const ApiKeyConfigFormDialog = ({
  editId,
  open,
  onClose,
}: ApiKeyConfigFormDialogProps) => {
  const [showApiKey, setShowApiKey] = useState(false)
  const {
    formData,
    isEditMode,
    handleApiKeyChange,
    handleEndpointChange,
    handleModelChange,
    handleSubmit,
  } = useApiKeyConfigForm(editId, onClose)

  const handleDialogClose = useCallback(() => {
    setShowApiKey(false)
    onClose()
  }, [onClose])

  return (
    <Dialog open={open} onClose={handleDialogClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-linear-to-r from-purple-500 to-pink-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isEditMode ? (
                  <RiEditLine className="h-6 w-6 text-white" />
                ) : (
                  <RiAddLine className="h-6 w-6 text-white" />
                )}
                <DialogTitle className="text-lg font-semibold text-white">
                  {isEditMode ? '编辑模型配置' : '添加模型配置'}
                </DialogTitle>
              </div>
              <button
                onClick={handleDialogClose}
                className="text-white/80 transition-colors duration-200 hover:text-white"
                aria-label="关闭"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4 px-6 py-6">
            <TextField
              value={formData.endpoint}
              onChange={handleEndpointChange}
            >
              <Label className="mb-2 block text-sm font-medium text-purple-700">
                端点
              </Label>
              <Input
                type="text"
                className="w-full rounded-lg border border-pink-200 bg-white text-gray-700 transition-all duration-200 placeholder-pink-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="例如：https://api.openai.com/v1"
              />
            </TextField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField value={formData.apiKey} onChange={handleApiKeyChange}>
                <Label className="mb-2 block text-sm font-medium text-purple-700">
                  API Key
                </Label>
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  className="w-full rounded-lg border border-pink-200 bg-white text-gray-700 transition-all duration-200 placeholder-pink-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder={isEditMode ? '留空则保持原有 API Key' : '例如：sk-proj-****xxxx'}
                  autoComplete="new-password"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowApiKey(value => !value)}
                    className="text-xs text-purple-600 transition-colors duration-200 hover:text-purple-700"
                  >
                    {showApiKey ? '隐藏 API Key' : '显示 API Key'}
                  </button>
                </div>
              </TextField>

              <TextField value={formData.model} onChange={handleModelChange}>
                <Label className="mb-2 block text-sm font-medium text-purple-700">
                  模型
                </Label>
                <Input
                  type="text"
                  className="w-full rounded-lg border border-pink-200 bg-white text-gray-700 transition-all duration-200 placeholder-pink-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="例如：gpt-4o"
                />
              </TextField>
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
            <Button
              onClick={handleDialogClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              className="rounded-lg bg-linear-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-purple-600 hover:to-pink-600"
            >
              {isEditMode ? '保存修改' : '确认添加'}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default memo(ApiKeyConfigFormDialog)
