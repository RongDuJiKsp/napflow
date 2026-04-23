import z from 'zod'

export enum InternErrorSource {
  WindowError = 'window-error',
  UnhandledRejection = 'unhandledrejection',
  NextErrorBoundary = 'next-error-boundary',
  NextGlobalErrorBoundary = 'next-global-error-boundary',
}

export const ZodCheckInternErrorReportPayload = z.object({
  source: z.enum(InternErrorSource),
  message: z.string().min(1).max(4000),
  stack: z.string().max(16000).optional(),
  url: z.string().max(2000).optional(),
  userAgent: z.string().max(2000).optional(),
  at: z.number().int().positive().optional(),
  digest: z.string().max(256).optional(),
})

export type InternErrorReportPayload = z.infer<typeof ZodCheckInternErrorReportPayload>

export type InternErrorItem = {
  id: string;
  source: InternErrorSource;
  message: string;
  stack: string | null;
  url: string | null;
  userAgent: string | null;
  happenedAtMs: number;
  receivedAtMs: number;
  lastSeenAtMs: number;
  duplicateCount: number;
  fingerprint: string;
  digest: string | null;
}

export type InternErrorTrendPoint = {
  minuteStartMs: number;
  count: number;
}

export type InternErrorDashboardData = {
  nowMs: number;
  windowMinutes: number;
  total: number;
  bySource: Record<InternErrorSource, number>;
  trend: InternErrorTrendPoint[];
  items: InternErrorItem[];
}

export type DataReportDashboardResp = {
  ok: boolean;
  message?: string;
  data?: InternErrorDashboardData;
}
