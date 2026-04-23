'use client'

import { memo, useEffect } from 'react'
import { dataReportClient } from '@/utils/data-report/client'
import { InternErrorSource } from '@/utils/data-report/shared/error-report-contract'

const InternErrorCaptureBootstrap = () => {
  useEffect(() => {
    const onWindowError = (event: ErrorEvent) => {
      const fallbackMessage = event.message
        || (event.filename
          ? `Script error at ${event.filename}:${event.lineno}:${event.colno}`
          : 'Unknown window error')

      dataReportClient.reportClientError({
        source: InternErrorSource.WindowError,
        error: event.error,
        message: fallbackMessage,
      })
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      dataReportClient.reportClientError({
        source: InternErrorSource.UnhandledRejection,
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
