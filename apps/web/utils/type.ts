import type React from 'react'

export type ComponentWithClass = React.ComponentType<{ className?: string }>

export type DataKV = Record<string, unknown>
