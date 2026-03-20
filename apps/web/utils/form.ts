import type { PartialDeep } from 'type-fest'

export const makeAllCanBeFalseToUndefined = <T>(obj: T): PartialDeep<T> => {
  const transform = (value: unknown): unknown => {
    if (Array.isArray(value))
      return value.map(item => transform(item))

    if (value !== null && typeof value === 'object') {
      const next: Record<string, unknown> = {}

      for (const [key, item] of Object.entries(value))
        next[key] = transform(item)

      return next
    }

    return Boolean(value) ? value : undefined
  }

  return transform(obj) as PartialDeep<T>
}
