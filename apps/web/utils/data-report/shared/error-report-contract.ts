import z from 'zod'

export const internErrorSourceSchema = z.enum([
  'window-error',
  'unhandledrejection',
  'next-error-boundary',
  'next-global-error-boundary',
])

export type InternErrorSource = z.infer<typeof internErrorSourceSchema>

export const internErrorReportPayloadSchema = z.object({
  source: internErrorSourceSchema,
  message: z.string().trim().min(1).max(4000),
  stack: z.string().trim().max(16000).optional(),
  url: z.string().trim().max(2000).optional(),
  userAgent: z.string().trim().max(2000).optional(),
  at: z.number().int().positive().optional(),
  digest: z.string().trim().max(256).optional(),
})

export type InternErrorReportPayload = z.infer<typeof internErrorReportPayloadSchema>

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
