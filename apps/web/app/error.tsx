'use client'

import { useEffect } from 'react'
import { dataReport } from '@/utils/data-report'

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    dataReport.client.reportClientError({
      source: 'next-error-boundary',
      error,
      digest: error.digest,
      message: error.message || 'Next.js error boundary captured an exception',
    })
  }, [error])

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-red-700">页面渲染发生异常</h2>
        <p className="text-sm text-red-700/90">
          错误已上报到内部面板，请稍后重试。
        </p>
        <pre className="max-h-56 overflow-auto rounded bg-white/80 p-3 text-xs text-red-900">
          {error.message}
        </pre>
        <button
          className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
          onClick={() => reset()}
          type="button"
        >
          重新尝试
        </button>
      </div>
    </div>
  )
}
