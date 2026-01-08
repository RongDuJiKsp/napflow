import { useCallback } from 'react'
import type { StoreApi } from 'zustand'

export const useZustandSetAction = <T>(store: StoreApi<T>) => {
  return useCallback((...props: Parameters<StoreApi<T>['setState']>) => store.setState(...props), [store])
}
