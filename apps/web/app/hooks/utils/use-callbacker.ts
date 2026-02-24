import { useCallback } from 'react'

export const useNorReturnFn = <T extends (...args: any[]) => any>(fn: T) => {
  return useCallback((...params: Parameters<T>) => {
    return !fn(...params)
  }, [fn])
}
