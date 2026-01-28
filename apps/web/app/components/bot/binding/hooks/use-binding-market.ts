import { useAppsQuery } from '@/app/hooks/query/use-apps-query'
import { useCallback, useMemo, useState } from 'react'

export type SelectPair = {
  appId: string;
  version: string;

}

export type SelectedItem = SelectPair & {
  appName: string;
}

export const useBindingMarket = (onClose?: () => void) => {
  const { data: apps } = useAppsQuery()

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
      if (prev.some(item => item.appId === appId && item.version === version)) return prev
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

  const handleConfirm = useCallback(() => {
    console.log('Selected items:', selectedItems)
    onClose?.()
  }, [selectedItems, onClose])

  return {
    apps,
    selectItemsWithName,
    selectedItems,
    handleAddItem,
    handleRemoveItem,
    handleConfirm,
  }
}
