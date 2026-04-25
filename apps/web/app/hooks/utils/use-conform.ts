'use client'

import { useCallback, useState } from 'react'

export const useConform = (onConfirmed: () => void | Promise<void>) => {
  const [isModelOpen, setIsModelOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onCancel = useCallback(() => {
    if (isSubmitting) return
    setIsModelOpen(false)
  }, [isSubmitting])

  const onConform = useCallback(async () => {
    if (!isModelOpen) {
      setIsModelOpen(true)
      return
    }
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await onConfirmed()
      setIsModelOpen(false)
    }
    finally {
      setIsSubmitting(false)
    }
  }, [isModelOpen, isSubmitting, onConfirmed])

  return { isModelOpen, onCancel, onConform }
}
