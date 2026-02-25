import type { BaseSyntheticEvent } from 'react'
import { useCallback } from 'react'

export const useNorReturnFn = <T extends (...args: any[]) => any>(fn: T) => {
  return useCallback((...params: Parameters<T>) => {
    return !fn(...params)
  }, [fn])
}

export const useInputElementEventValueFn = <E extends HTMLElement & { value: string }, T extends BaseSyntheticEvent<unknown, unknown, E>>(recv: (content: string) => void) => {
  return useCallback((e: T) => {
    recv(e.target.value)
  }, [recv])
}
