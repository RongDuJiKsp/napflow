'use client'
import { Alert, Button, Segmented, Select, Typography } from 'antd'
import { RiSparkling2Line } from '@remixicon/react'
import { memo, useEffect, useMemo, useState } from 'react'
import { useRecoverSessionListQuery } from '@/app/hooks/query/agent/use-recover-session-list-query'
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
  const [sessionMode, setSessionMode] = useState<AgentWsConnType>(AgentWsConnType.NewConnection)
  const [selectedRecoverSessionId, setSelectedRecoverSessionId] = useState<string>()

  const { isApiKeyListError, apiKeyListError, isApiKeyListPending, selectedConfigId, selectedModelConfig, modelOptions, findApiKeyItem, setSelectedConfigId } = useModelSelection()
  const {
    data: recoverableSessions = [],
    error: recoverSessionListError,
    isError: isRecoverSessionListError,
    isPending: isRecoverSessionListPending,
  } = useRecoverSessionListQuery()

  const recoverSessionOptions = useMemo(
    () =>
      recoverableSessions.map(item => ({
        label: item.title,
        value: item.sessionId,
      })),
    [recoverableSessions],
  )

  const selectedRecoverSession = useMemo(
    () => recoverableSessions.find(item => item.sessionId === selectedRecoverSessionId),
    [recoverableSessions, selectedRecoverSessionId],
  )

  useEffect(() => {
    if (sessionMode === AgentWsConnType.NewConnection && selectedConfigId) {
      onConnTokenChange(serdeConnToken(AgentWsConnType.NewConnection, selectedConfigId))
      return
    }

    if (sessionMode === AgentWsConnType.RecoveryConnection && selectedRecoverSessionId) {
      onConnTokenChange(
        serdeConnToken(AgentWsConnType.RecoveryConnection, selectedRecoverSessionId),
      )
      return
    }

    onConnTokenChange('')
  }, [selectedConfigId, selectedRecoverSessionId, sessionMode, onConnTokenChange])

  const canEnterChat = sessionMode === AgentWsConnType.NewConnection
    ? Boolean(selectedConfigId)
    : Boolean(selectedRecoverSessionId)

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
        </div>
        <Typography.Text type="secondary">
          你可以创建一个新会话，也可以恢复一个历史会话继续对话。
        </Typography.Text>
      </div>

      <Segmented
        block
        value={sessionMode}
        onChange={value => setSessionMode(value as AgentWsConnType)}
        options={[
          {
            label: '新建会话',
            value: AgentWsConnType.NewConnection,
          },
          {
            label: '恢复会话',
            value: AgentWsConnType.RecoveryConnection,
          },
        ]}
      />

      {sessionMode === AgentWsConnType.NewConnection && isApiKeyListError && (
        <Alert
          type="error"
          showIcon
          title="加载模型列表失败"
          description={apiKeyListError instanceof Error ? apiKeyListError.message : '请稍后重试'}
        />
      )}

      {sessionMode === AgentWsConnType.NewConnection && (
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
      )}

      {sessionMode === AgentWsConnType.RecoveryConnection && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
          <Typography.Text className="mb-2 block text-sm font-medium text-gray-700">
            历史会话
          </Typography.Text>
          <Select
            className="w-full"
            placeholder={isRecoverSessionListPending ? '历史会话加载中...' : '请选择要恢复的会话'}
            loading={isRecoverSessionListPending}
            options={recoverSessionOptions}
            value={selectedRecoverSessionId}
            onChange={setSelectedRecoverSessionId}
            disabled={isRecoverSessionListPending || recoverSessionOptions.length === 0}
            optionRender={(option) => {
              const session = recoverableSessions.find(item => item.sessionId === option.data.value)
              return (
                <div className="py-1">
                  <div className="text-sm font-medium text-gray-800">{session?.title}</div>
                  <div className="text-xs text-gray-400">{session?.sessionId}</div>
                  <div className="text-xs text-gray-400">{session ? new Date(session.createdAt).toLocaleString('zh-CN') : ''}</div>
                </div>
              )
            }}
          />
        </div>
      )}

      {sessionMode === AgentWsConnType.NewConnection && selectedModelConfig && (
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

      {sessionMode === AgentWsConnType.RecoveryConnection && selectedRecoverSessionId && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <Typography.Text className="mb-2 block text-xs font-medium uppercase tracking-wide text-emerald-600">
            已选择会话
          </Typography.Text>
          <div className="text-sm font-semibold text-emerald-800">
            {selectedRecoverSession?.title ?? '未摘要对话'}
          </div>
          <div className="text-sm font-semibold break-all text-emerald-800">
            {selectedRecoverSessionId}
          </div>
          {selectedRecoverSession && (
            <div className="mt-1 text-xs text-emerald-700/80">
              创建时间：{new Date(selectedRecoverSession.createdAt).toLocaleString('zh-CN')}
            </div>
          )}
        </div>
      )}

      {sessionMode === AgentWsConnType.NewConnection && !isApiKeyListPending && !isApiKeyListError && modelOptions.length === 0 && (
        <Alert
          type="info"
          showIcon
          message="当前没有可用模型配置"
          description="请先在设置页添加模型配置后再使用 Agent。"
        />
      )}

      {sessionMode === AgentWsConnType.RecoveryConnection && isRecoverSessionListError && (
        <Alert
          type="error"
          showIcon
          message="加载历史会话失败"
          description={recoverSessionListError instanceof Error ? recoverSessionListError.message : '请稍后重试'}
        />
      )}

      {sessionMode === AgentWsConnType.RecoveryConnection && !isRecoverSessionListPending && !isRecoverSessionListError && recoverSessionOptions.length === 0 && (
        <Alert
          type="info"
          showIcon
          message="当前没有可恢复会话"
          description="你还没有可恢复的 Agent 会话，请先创建新会话。"
        />
      )}

      <div className="mt-auto flex justify-end">
        <Button
          type="primary"
          onClick={onEnterChat}
          disabled={!canEnterChat}
          size="large"
        >
          开始对话
        </Button>
      </div>
    </div>
  )
}

export default memo(AgentSelect)
