import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'
import { produce } from 'immer'

export const useAreaChange = <Value extends Record<string, unknown>, Area extends keyof Value>(setter: Dispatch<SetStateAction<Value>>, area: Area) => {
  return useCallback((value: Value[Area]) => {
    setter(prev => produce(prev, (draft: Value) => {
      draft[area] = value
    }))
  }, [setter, area])
}
