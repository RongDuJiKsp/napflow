import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'

export const useClear = <Value>(setStateAction: Dispatch<SetStateAction<Value>>, defaultValue: Value) => {
  return useCallback(() => {
    setStateAction(defaultValue)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStateAction, JSON.stringify(defaultValue)])
}
