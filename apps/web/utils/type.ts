import type React from 'react'

export type ComponentWithClass = React.ComponentType<{ className?: string }>

export type PartialWithout<T, K extends keyof T> = Partial<Omit<T, K>>
  & Pick<T, K>

export type ParamTypeofReactComp<T extends React.FunctionComponent> = Parameters<T>[0]
