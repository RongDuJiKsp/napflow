'use client'

import { memo, useEffect } from 'react'
import { dataReport } from '@/utils/data-report'

const InternErrorCaptureBootstrap = () => {
  useEffect(() => {
    const onWindowError = (event: ErrorEvent) => {
      const fallbackMessage = event.message
        || (event.filename
          ? `Script error at ${event.filename}:${event.lineno}:${event.colno}`
          : 'Unknown window error')

      dataReport.client.reportClientError({
        source: 'window-error',
        error: event.error,
        message: fallbackMessage,
      })
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      dataReport.client.reportClientError({
        source: 'unhandledrejection',
        error: event.reason,
        message: 'Unhandled promise rejection',
      })
    }

    window.addEventListener('error', onWindowError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)

    return () => {
      window.removeEventListener('error', onWindowError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [])

  return null
}

export default memo(InternErrorCaptureBootstrap)
