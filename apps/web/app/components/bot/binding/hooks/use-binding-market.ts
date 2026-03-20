import { useAppsQuery } from '@/app/hooks/query/workflow/use-apps-query'
import { useSubmitZod } from '@/app/hooks/utils/use-form'
import { useCallback, useMemo, useState } from 'react'
import type { BotBridgeBindReq } from '@shared/data-transfer/bot/bridge'
import { ZodCheckBotBridgeBindReq } from '@shared/data-transfer/bot/bridge'
import { jsonQ } from '@/utils/net'
import { useBotParam } from '../../hooks/use-bot-param'
import { Code, type NullResp } from '@shared/data-transfer/_base'
import { useBindingBotQuery } from '@/app/hooks/query/bot/bot-bridge/use-binding-bot-query'

export type SelectPair = {
  appId: string;
  version: string;
}

export type SelectedItem = SelectPair & {
  appName: string;
}

export const useBindingMarket = (onClose?: () => void) => {
  const { botId } = useBotParam()
  const { data: apps } = useAppsQuery()
  const { refetch } = useBindingBotQuery(botId)

  const [selectedItems, setSelectedItems] = useState<SelectPair[]>([])

  const selectItemsWithName = useMemo(() => {
    const nameMap = new Map<string, string>()
    apps?.forEach((app) => {
      nameMap.set(app.appId, app.appName)
    })
    return selectedItems.map(item => ({
      ...item,
      appName: nameMap.get(item.appId) || '',
    }))
  }, [selectedItems, apps])

  const handleAddItem = useCallback(({ appId, version }: SelectPair) => {
    setSelectedItems((prev) => {
      if (prev.some(item => item.appId === appId && item.version === version))
        return prev
      return [...prev, { appId, version }]
    })
  }, [])

  const handleRemoveItem = useCallback(({ appId, version }: SelectPair) => {
    setSelectedItems(prev =>
      prev.filter(
        item => !(item.appId === appId && item.version === version),
      ),
    )
  }, [])

  const req = useMemo(
    () =>
      selectedItems.map(item => ({
        appId: item.appId,
        appVersion: item.version,
      })),
    [selectedItems],
  )
  const doFetch = useCallback(
    async (data: BotBridgeBindReq) =>
      await jsonQ.Post<NullResp>(`/bot/bridge/${botId}/bindmany`, data),
    [botId],
  )
  const doSubmit = useSubmitZod<BotBridgeBindReq, NullResp>(
    req,
    ZodCheckBotBridgeBindReq,
    doFetch,
    { successText: '绑定成功', errorText: '绑定失败' },
  )

  const handleConfirm = useCallback(async () => {
    if ((await doSubmit())?.statusCode === Code.Ok) {
      await refetch()
      onClose?.()
    }
  }, [onClose, doSubmit, refetch])

  return {
    apps,
    selectItemsWithName,
    selectedItems,
    handleAddItem,
    handleRemoveItem,
    handleConfirm,
  }
}
