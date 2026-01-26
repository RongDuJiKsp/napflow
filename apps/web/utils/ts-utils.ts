/**
 * 类型安全的 Pick 实现
 * 从对象中选择指定的属性，创建一个新对象
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[] | readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>

  for (const key of keys) {
    if (key in obj)
      result[key] = obj[key]
  }

  return result
}
