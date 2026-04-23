'use client'

import { useEffect } from 'react'
import { dataReportClient } from '@/utils/data-report/client'
import { InternErrorSource } from '@/utils/data-report/shared/error-report-contract'
import type { NextErrorBoundaryProps } from '@/utils/type'

export default function GlobalErrorPage({ error, reset }: NextErrorBoundaryProps) {
  useEffect(() => {
    dataReportClient.reportClientError({
      source: InternErrorSource.NextGlobalErrorBoundary,
      error,
      digest: error.digest,
      message: error.message || 'Next.js global error boundary captured an exception',
    })
  }, [error])

  return (
    <html lang="zh">
      <body>
        <div className="min-h-screen w-full flex items-center justify-center bg-red-50 p-8">
          <div className="w-full max-w-2xl rounded-xl border border-red-200 bg-white p-6 space-y-4 shadow-sm">
            <h2 className="text-xl font-semibold text-red-700">应用发生严重异常</h2>
            <p className="text-sm text-red-700/90">
              错误已上报到内部面板，请刷新或稍后重试。
            </p>
            <pre className="max-h-64 overflow-auto rounded bg-red-50 p-3 text-xs text-red-900">
              {error.message}
            </pre>
            <button
              className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
              onClick={reset}
              type="button"
            >
              再试一次
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
