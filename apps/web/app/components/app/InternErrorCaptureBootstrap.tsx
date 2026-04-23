'use client'

import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import { dataReportClient } from '@/utils/data-report/client'
import { InternErrorSource } from '@/utils/data-report/shared/error-report-contract'
import { useEventListener } from 'ahooks'

const InternErrorCaptureBootstrap = ({ children }: PropsWithChildren) => {
  useEventListener('error', (event: ErrorEvent) => {
    const fallbackMessage = event.message
        || (event.filename
          ? `Script error at ${event.filename}:${event.lineno}:${event.colno}`
          : 'Unknown window error')

    dataReportClient.reportClientError({
      source: InternErrorSource.WindowError,
      error: event.error,
      message: fallbackMessage,
    })
  })

  useEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    dataReportClient.reportClientError({
      source: InternErrorSource.UnhandledRejection,
      error: event.reason,
      message: 'Unhandled promise rejection',
    })
  })
  return children
}

export default memo(InternErrorCaptureBootstrap)
