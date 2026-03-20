/**
 * 尝试将字符串 JSON.parse 为目标类型，解析失败则保留原值交给 zod 校验
 */
export const tryParseJson = (val: unknown): unknown => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val)
    }
    catch (_e) {
      return val
    }
  }
  return val
}
