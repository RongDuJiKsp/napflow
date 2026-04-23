'use client'

import type { InternErrorSource } from '@/utils/data-report/shared/error-report-contract'
import { memo } from 'react'
import { StatCard } from './common'
import { sourceLabel } from './utils'

type OverviewAreaProps = {
  total: number;
  bySource: Record<InternErrorSource, number>;
}

const OverviewArea = ({ total, bySource }: OverviewAreaProps) => {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <StatCard title="总异常次数" value={total} />
      {Object.entries(sourceLabel).map(([source, label]) => (
        <StatCard
          key={source}
          title={label}
          value={bySource[source as InternErrorSource]}
        />
      ))}
    </section>
  )
}

export default memo(OverviewArea)
