import type React from 'react'

export type ComponentWithClass = React.ComponentType<{ className?: string }>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataKV = Record<string, any>
