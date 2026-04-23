import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dataReport } from '@/utils/data-report'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  }
  catch {
    return NextResponse.json(
      {
        ok: false,
        message: '请求体不是有效 JSON',
      },
      { status: 400 },
    )
  }

  const parseResult = dataReport.shared.internErrorReportPayloadSchema.safeParse(payload)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        ok: false,
        message: z.prettifyError(parseResult.error),
      },
      { status: 400 },
    )
  }

  const result = dataReport.server.addErrorRecord(parseResult.data)

  return NextResponse.json({
    ok: true,
    deduped: result.deduped,
    id: result.item.id,
  })
}
