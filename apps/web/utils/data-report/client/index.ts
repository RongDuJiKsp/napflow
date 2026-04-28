import { serializeError } from 'serialize-error'
import type {
  InternErrorReportPayload,
  InternErrorSource,
} from '../shared/error-report-contract'
import { ClientOnly } from '../shared/runtime-guard'
import { tryit } from 'radash'

const reporter = {
  endpoint: '/__intern_view__/report',
  sendByFetch(payloadText: string) {
    const [err] = tryit(() => {
      fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payloadText,
        keepalive: true,
      }).catch(() => undefined)
    })()
    return !err
  },
  sendByBeacon(payloadText: string) {
    if (typeof navigator === 'undefined' || !navigator.sendBeacon) return false
    const blob = new Blob([payloadText], {
      type: 'application/json',
    })
    return navigator.sendBeacon(this.endpoint, blob)
  },
}

export type ReportClientErrorInput = {
  source: InternErrorSource;
  error?: unknown;
  message?: string;
  stack?: string;
  digest?: string;
  url?: string;
}

class DataReportClient {
  @ClientOnly('dataReport.client.reportInternErrorPayload')
  reportInternErrorPayload(payload: InternErrorReportPayload) {
    const payloadText = JSON.stringify(payload)
    if (!reporter.sendByBeacon(payloadText)) reporter.sendByFetch(payloadText)
  }

  @ClientOnly('dataReport.client.reportClientError')
  reportClientError({
    source,
    error,
    message,
    stack,
    digest,
    url,
  }: ReportClientErrorInput) {
    const extracted = serializeError(error)
    this.reportInternErrorPayload({
      source,
      message: message?.trim() || extracted.message || 'Unknown error',
      stack: stack ?? extracted.stack,
      digest: digest ?? undefined,
      url: url ?? window.location.href,
      userAgent: navigator.userAgent,
      at: Date.now(),
    })
  }
}

export const dataReportClient = new DataReportClient()
