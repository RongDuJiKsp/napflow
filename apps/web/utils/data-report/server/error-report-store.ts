import type {
  InternErrorDashboardData,
  InternErrorItem,
  InternErrorReportPayload,
  InternErrorSource,
  InternErrorTrendPoint,
} from '../shared/error-report-contract'

const DEFAULT_WINDOW_MS = 30 * 60 * 1000
const DEFAULT_DEDUPE_WINDOW_MS = 10 * 1000
const DEFAULT_MAX_ITEMS = 3000

type FingerprintRef = {
  itemId: string;
  lastSeenAtMs: number;
}

type InternErrorStoreOptions = {
  windowMs?: number;
  dedupeWindowMs?: number;
  maxItems?: number;
}

export type AddReportResult = {
  deduped: boolean;
  item: InternErrorItem;
}

const createBySource = (): Record<InternErrorSource, number> => ({
  'window-error': 0,
  'unhandledrejection': 0,
  'next-error-boundary': 0,
  'next-global-error-boundary': 0,
})

const toMinuteStart = (timeMs: number) => Math.floor(timeMs / 60000) * 60000

const compactText = (value: string | undefined, limit: number): string | null => {
  if (!value) return null
  if (value.length <= limit) return value
  return `${value.slice(0, limit)}...`
}

const buildFingerprint = (payload: InternErrorReportPayload) => {
  const source = payload.source
  const message = payload.message.trim().slice(0, 1000)
  const stack = payload.stack?.trim().slice(0, 1000) ?? ''
  const url = payload.url?.trim().slice(0, 1000) ?? ''
  return `${source}|${message}|${stack}|${url}`
}

const pickHappenedAt = (payloadAt: number | undefined, nowMs: number) => {
  if (!payloadAt) return nowMs
  if (payloadAt > nowMs + 60 * 1000) return nowMs
  if (payloadAt < nowMs - 24 * 60 * 60 * 1000) return nowMs
  return payloadAt
}

export class InternErrorStore {
  private readonly windowMs: number

  private readonly dedupeWindowMs: number

  private readonly maxItems: number

  private items: InternErrorItem[] = []

  private refs = new Map<string, FingerprintRef>()

  private seq = 0

  constructor({
    windowMs = DEFAULT_WINDOW_MS,
    dedupeWindowMs = DEFAULT_DEDUPE_WINDOW_MS,
    maxItems = DEFAULT_MAX_ITEMS,
  }: InternErrorStoreOptions = {}) {
    this.windowMs = windowMs
    this.dedupeWindowMs = dedupeWindowMs
    this.maxItems = maxItems
  }

  private rebuildRefs() {
    this.refs.clear()

    for (const item of this.items) {
      this.refs.set(item.fingerprint, {
        itemId: item.id,
        lastSeenAtMs: item.lastSeenAtMs,
      })
    }
  }

  private cleanup(nowMs: number) {
    const expireBefore = nowMs - this.windowMs
    this.items = this.items.filter(item => item.lastSeenAtMs >= expireBefore)

    if (this.items.length > this.maxItems)
      this.items = this.items.slice(this.items.length - this.maxItems)

    this.rebuildRefs()
  }

  private getTrend(nowMs: number): InternErrorTrendPoint[] {
    const start = toMinuteStart(nowMs - this.windowMs)
    const end = toMinuteStart(nowMs)
    const buckets = new Map<number, number>()

    for (let cursor = start; cursor <= end; cursor += 60000)
      buckets.set(cursor, 0)

    for (const item of this.items) {
      const bucket = toMinuteStart(item.lastSeenAtMs)
      if (!buckets.has(bucket)) continue
      buckets.set(bucket, (buckets.get(bucket) ?? 0) + item.duplicateCount)
    }

    return Array.from(buckets.entries())
      .sort(([left], [right]) => left - right)
      .map(([minuteStartMs, count]) => ({ minuteStartMs, count }))
  }

  addReport(payload: InternErrorReportPayload, nowMs = Date.now()): AddReportResult {
    this.cleanup(nowMs)

    const fingerprint = buildFingerprint(payload)
    const ref = this.refs.get(fingerprint)

    if (ref && nowMs - ref.lastSeenAtMs <= this.dedupeWindowMs) {
      const hit = this.items.find(item => item.id === ref.itemId)
      if (hit) {
        hit.duplicateCount += 1
        hit.lastSeenAtMs = nowMs
        hit.receivedAtMs = nowMs

        this.refs.set(fingerprint, {
          itemId: hit.id,
          lastSeenAtMs: nowMs,
        })

        return {
          deduped: true,
          item: hit,
        }
      }
    }

    this.seq += 1

    const item: InternErrorItem = {
      id: `${nowMs}-${this.seq}`,
      source: payload.source,
      message: payload.message.trim().slice(0, 4000),
      stack: compactText(payload.stack?.trim(), 16000),
      url: compactText(payload.url?.trim(), 2000),
      userAgent: compactText(payload.userAgent?.trim(), 2000),
      happenedAtMs: pickHappenedAt(payload.at, nowMs),
      receivedAtMs: nowMs,
      lastSeenAtMs: nowMs,
      duplicateCount: 1,
      fingerprint,
      digest: compactText(payload.digest?.trim(), 256),
    }

    this.items.push(item)

    this.refs.set(fingerprint, {
      itemId: item.id,
      lastSeenAtMs: nowMs,
    })

    return {
      deduped: false,
      item,
    }
  }

  getSnapshot(nowMs = Date.now()): InternErrorDashboardData {
    this.cleanup(nowMs)

    const bySource = createBySource()
    let total = 0

    for (const item of this.items) {
      bySource[item.source] += item.duplicateCount
      total += item.duplicateCount
    }

    return {
      nowMs,
      windowMinutes: Math.floor(this.windowMs / 60000),
      total,
      bySource,
      trend: this.getTrend(nowMs),
      items: [...this.items].sort((left, right) => right.lastSeenAtMs - left.lastSeenAtMs),
    }
  }

  clear() {
    this.items = []
    this.refs.clear()
  }
}

export const createInternErrorStore = (options: InternErrorStoreOptions = {}): InternErrorStore =>
  new InternErrorStore(options)

type GlobalStoreCarrier = {
  __napflowInternErrorStore?: InternErrorStore;
}

const globalStoreCarrier = globalThis as typeof globalThis & GlobalStoreCarrier

export const getInternErrorStore = () => {
  if (!globalStoreCarrier.__napflowInternErrorStore)
    globalStoreCarrier.__napflowInternErrorStore = createInternErrorStore()

  return globalStoreCarrier.__napflowInternErrorStore
}
