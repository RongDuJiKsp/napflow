import type {
  InternErrorReportPayload,
  InternErrorSource,
} from '../shared/error-report-contract'
import { ClientOnly } from '../shared/runtime-guard'

const REPORT_ENDPOINT = '/__intern_view__/report'

export type ExtractedErrorLike = {
  message: string;
  stack?: string;
}

export type ReportClientErrorInput = {
  source: InternErrorSource;
  error?: unknown;
  message?: string;
  stack?: string | null;
  digest?: string | null;
  url?: string | null;
}

const getMessageFromObject = (value: Record<string, unknown>) => {
  const message = value.message
  if (typeof message === 'string' && message.trim()) return message
  return null
}

const extractErrorLike = (value: unknown): ExtractedErrorLike => {
  if (value instanceof Error) {
    return {
      message: value.message || value.name || 'Unknown error',
      stack: value.stack,
    }
  }

  if (typeof value === 'string' && value.trim()) {
    return {
      message: value,
    }
  }

  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>
    const message = getMessageFromObject(objectValue)
    const stack = typeof objectValue.stack === 'string'
      ? objectValue.stack
      : undefined

    if (message) {
      return {
        message,
        stack,
      }
    }
  }

  try {
    return {
      message: JSON.stringify(value),
    }
  }
  catch {
    return {
      message: String(value),
    }
  }
}

const sendByFetch = (payloadText: string) => {
  fetch(REPORT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payloadText,
    keepalive: true,
  }).catch(() => undefined)
}

const sendByBeacon = (payloadText: string) => {
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) return false

  try {
    const blob = new Blob([payloadText], {
      type: 'application/json',
    })

    return navigator.sendBeacon(REPORT_ENDPOINT, blob)
  }
  catch {
    return false
  }
}

class DataReportClient {
  extractErrorLike(value: unknown) {
    return extractErrorLike(value)
  }

  @ClientOnly('dataReport.client.reportInternErrorPayload')
  reportInternErrorPayload(payload: InternErrorReportPayload) {
    const payloadText = JSON.stringify(payload)
    if (!sendByBeacon(payloadText)) sendByFetch(payloadText)
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
    const extracted = extractErrorLike(error)

    const payload: InternErrorReportPayload = {
      source,
      message: message?.trim() || extracted.message || 'Unknown error',
      stack: stack ?? extracted.stack,
      digest: digest ?? undefined,
      url: url ?? window.location.href,
      userAgent: navigator.userAgent,
      at: Date.now(),
    }

    const payloadText = JSON.stringify(payload)
    if (!sendByBeacon(payloadText)) sendByFetch(payloadText)
  }
}

export const dataReportClient = new DataReportClient()
