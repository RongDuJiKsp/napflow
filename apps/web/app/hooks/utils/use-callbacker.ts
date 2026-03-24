import type { BaseSyntheticEvent } from 'react'
import { useCallback, useMemo } from 'react'

export const useNorReturnFn = <T extends (...args: any[]) => any>(fn: T) => {
  return useCallback(
    (...params: Parameters<T>) => {
      return !fn(...params)
    },
    [fn],
  )
}

export const useInputElementEventValueFn = <
  E extends HTMLElement & { value: string },
  T extends BaseSyntheticEvent<unknown, unknown, E>,
>(
  recv: (content: string) => void,
) => {
  return useCallback(
    (e: T) => {
      recv(e.target.value)
    },
    [recv],
  )
}

export const useArrayDict = <T>(
  array: T[],
  indexGetter: (item: T) => string,
) => {
  const map = useMemo(
    () => Object.fromEntries(array.map(item => [indexGetter(item), item])),
    [array, indexGetter],
  )
  const findItem = useCallback((id: string) => map[id], [map])
  return {
    findItem
  }
}
