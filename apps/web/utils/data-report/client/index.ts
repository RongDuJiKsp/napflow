import {
  extractErrorLike,
  reportClientErrorCore,
  reportInternErrorPayloadCore,
} from './error-report-client'
import type {
  ReportClientErrorInput,
} from './error-report-client'
import type {
  InternErrorReportPayload,
} from '../shared/error-report-contract'
import { ClientOnly } from '../shared/runtime-guard'

class DataReportClient {
  extractErrorLike(value: unknown) {
    return extractErrorLike(value)
  }

  @ClientOnly('dataReport.client.reportInternErrorPayload')
  reportInternErrorPayload(payload: InternErrorReportPayload) {
    reportInternErrorPayloadCore(payload)
  }

  @ClientOnly('dataReport.client.reportClientError')
  reportClientError(input: ReportClientErrorInput) {
    reportClientErrorCore(input)
  }
}

export const dataReportClient = new DataReportClient()
