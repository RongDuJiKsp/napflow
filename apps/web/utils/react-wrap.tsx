import { noop } from 'lodash-es'
import type { Dispatch, SetStateAction } from 'react'
import { createContext, useContext } from 'react'

export function createContextState<State>() {
  const ValueContext = createContext<State | undefined>(undefined)
  const SetterContext = createContext<Dispatch<SetStateAction<State>>>(noop)
  const useValue = () => {
    return useContext(ValueContext) as State | undefined
  }
  const useSetter = <DownCast extends State = State>() => {
    // 只允许在Setter 向下转型
    return useContext(SetterContext) as Dispatch<SetStateAction<DownCast>>
  }
  const Provider = ({
    children,
    value,
    setValue,
  }: {
    children: React.ReactNode;
    value: State;
    setValue: Dispatch<SetStateAction<State>>;
  }) => (
    <ValueContext.Provider value={value}>
      <SetterContext.Provider value={setValue}>
        {children}
      </SetterContext.Provider>
    </ValueContext.Provider>
  )
  return {
    ValueContext,
    SetterContext,
    useValue,
    useSetter,
    Provider,
  }
}
