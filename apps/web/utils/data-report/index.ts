import { dataReportClient } from './client'
import { dataReportServer } from './server'
import {
  internErrorReportPayloadSchema,
  internErrorSourceSchema,
} from './shared/error-report-contract'
import {
  ClientOnly,
  ServerOnly,
} from './shared/runtime-guard'

class DataReportFacade {
  readonly shared = {
    internErrorReportPayloadSchema,
    internErrorSourceSchema,
  } as const

  @ClientOnly('dataReport.client')
  get client() {
    return dataReportClient
  }

  @ServerOnly('dataReport.server')
  get server() {
    return dataReportServer
  }
}

export const dataReport = new DataReportFacade()

export {
  internErrorReportPayloadSchema,
  internErrorSourceSchema,
}

export type {
  InternErrorDashboardData,
  InternErrorItem,
  InternErrorReportPayload,
  InternErrorSource,
  InternErrorTrendPoint,
} from './shared/error-report-contract'
