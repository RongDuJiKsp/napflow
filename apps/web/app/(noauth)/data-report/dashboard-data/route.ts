import { NextResponse } from 'next/server'
import { dataReport } from '@/utils/data-report'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const data = dataReport.server.getErrorRecordSnapshot()

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
