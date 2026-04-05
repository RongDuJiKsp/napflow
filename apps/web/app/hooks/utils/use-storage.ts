import { useLocalStorageState } from 'ahooks'
import { SYNC_STORAGE_EVENT_NAME } from 'ahooks/lib/createUseStorageState'

export const useLocalStorageStringValue = (key: string) => {
  const [value] = useLocalStorageState<string | undefined>(key, {
    listenStorageChange: true,
    serializer: (ele: string | undefined) => ele ?? '',
    deserializer: (ele: string) => ele,
  })
  return value
}

export const dispatchLocalStorageValueSet = (key: string, value?: string) => {
  const oldValue = localStorage.getItem(key) ?? undefined
  const newValue = value
  if (oldValue === newValue) return
  if (value === undefined) localStorage.removeItem(key)
  else localStorage.setItem(key, value)

  // 手动触发一个事件，通知同一页面的其他组件（包括当前组件）localStorage的值发生了变化
  dispatchEvent(
    new CustomEvent(SYNC_STORAGE_EVENT_NAME, {
      detail: {
        key,
        newValue,
        oldValue,
        storageArea: localStorage,
      },
    }),
  )
}
