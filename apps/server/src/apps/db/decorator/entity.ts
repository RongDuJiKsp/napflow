import type { ColumnOptions } from 'typeorm'
import { Column } from 'typeorm'

export const NotNullColumn = (options?: Omit<ColumnOptions, 'nullable'>) => {
  return Column({
    nullable: false,
    ...options,
  })
}

export const DefaultNullColumn = (
  options?: Omit<ColumnOptions, 'nullable' | 'default'>,
) => {
  return Column({
    nullable: true,
    default: null,
    ...options,
  })
}

export const Columns = {
  NotNullColumn,
  DefaultNullColumn,
}
