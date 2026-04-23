import type {
  InternErrorDashboardData,
  InternErrorReportPayload,
} from '../shared/error-report-contract'
import { ServerOnly } from '../shared/runtime-guard'
import { getInternErrorStore } from './error-report-store'

class DataReportServer {
  @ServerOnly('dataReport.server.addErrorRecord')
  addErrorRecord(payload: InternErrorReportPayload, nowMs?: number) {
    return getInternErrorStore().addReport(payload, nowMs)
  }

  @ServerOnly('dataReport.server.clearErrorRecords')
  clearErrorRecords() {
    getInternErrorStore().clear()
  }

  @ServerOnly('dataReport.server.getErrorRecordSnapshot')
  getErrorRecordSnapshot(nowMs?: number): InternErrorDashboardData {
    return getInternErrorStore().getSnapshot(nowMs)
  }
}

export const dataReportServer = new DataReportServer()
