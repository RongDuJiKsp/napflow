import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dataReportServer } from '@/utils/data-report/server'
import { ZodCheckInternErrorReportPayload } from '@/utils/data-report/shared/error-report-contract'
import { tryit } from 'radash'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const [err, payload] = await tryit(async (req: Request) => await req.json())(request)
  if(err) {
    return NextResponse.json(
      {
        ok: false,
        message: '请求体不是有效 JSON',
      },
      { status: 400 },
    )
  }

  const parseResult = ZodCheckInternErrorReportPayload.safeParse(payload)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        ok: false,
        message: z.prettifyError(parseResult.error),
      },
      { status: 400 },
    )
  }

  const result = dataReportServer.addErrorRecord(parseResult.data)

  return NextResponse.json({
    ok: true,
    deduped: result.deduped,
    id: result.item.id,
  })
}
