'use client'

import type { InternErrorItem } from '@/utils/data-report/shared/error-report-contract'
import { memo } from 'react'
import { ChartCard } from './common'
import { formatDateTime, sourceLabel } from './utils'

const DetailTableArea = ({ items }: {
  items: InternErrorItem[]
}) => {
  return (
    <ChartCard title="错误明细">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="w-40 px-2 py-2">时间</th>
              <th className="w-48 px-2 py-2">类型</th>
              <th className="w-24 px-2 py-2">次数</th>
              <th className="w-80 px-2 py-2">Message</th>
              <th className="w-lg px-2 py-2">Stack</th>
              <th className="w-80 px-2 py-2">URL / UserAgent</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr className="align-top border-b border-slate-100" key={item.id}>
                <td className="px-2 py-2 text-xs text-slate-500">
                  {formatDateTime(item.lastSeenAtMs)}
                </td>
                <td className="px-2 py-2 text-xs text-slate-700">
                  {sourceLabel[item.source]}
                </td>
                <td className="px-2 py-2 text-xs text-slate-700">
                  {item.duplicateCount}
                </td>
                <td className="px-2 py-2 text-xs text-slate-700">
                  <pre className="whitespace-pre-wrap wrap-break-word">{item.message}</pre>
                  {item.digest && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      digest: {item.digest}
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 text-xs text-slate-700">
                  {!item.stack && <span className="text-slate-400">无</span>}
                  {item.stack && (
                    <details>
                      <summary className="cursor-pointer text-emerald-700">
                        展开堆栈
                      </summary>
                      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap wrap-break-word rounded bg-slate-50 p-2 text-[11px]">
                        {item.stack}
                      </pre>
                    </details>
                  )}
                </td>
                <td className="px-2 py-2 text-xs text-slate-700">
                  <div className="break-all">{item.url || '未知 URL'}</div>
                  <div className="mt-2 max-h-16 overflow-auto rounded bg-slate-50 p-2 text-[11px] text-slate-500">
                    {item.userAgent || '未知 UserAgent'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  )
}

export default memo(DetailTableArea)
