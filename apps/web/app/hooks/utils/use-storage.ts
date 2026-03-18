import { useLocalStorageState } from 'ahooks'

export const useLocalStorageStringValue = (key: string) => {
  const [value] = useLocalStorageState<string | undefined>(key, { listenStorageChange: true, serializer: (ele: string | undefined) => ele ?? '', deserializer: (ele: string) => ele })
  return value
}
