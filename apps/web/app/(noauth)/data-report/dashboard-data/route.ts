import { NextResponse } from 'next/server'
import { dataReportServer } from '@/utils/data-report/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const data = dataReportServer.getErrorRecordSnapshot()

  return NextResponse.json(
    {
      ok: true,
      data,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}
