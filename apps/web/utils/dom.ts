import type React from 'react'

export const stopPropagation = (e: React.SyntheticEvent) => {
  e.stopPropagation()
}
