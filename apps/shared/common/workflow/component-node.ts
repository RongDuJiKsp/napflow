import z from 'zod'

// component nodes
export enum ComponentNodesEnum {
  Trigger = 'trigger',
  Reply = 'reply',
  If = 'if',
}
// node env
export enum VarTypes {
  String = 'string',
  Number = 'number',
  StringArray = 'Array<string>',
  NumberArray = 'Array<number>',
}

export const ZodCheckVar = z.object({
  name: z.string(),
  type: z.enum(VarTypes),
})
export type Var = z.infer<typeof ZodCheckVar>

/**
 * 尝试将字符串 JSON.parse 为目标类型，解析失败则保留原值交给 zod 校验
 */
const tryParseJson = (val: unknown): unknown => {
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
export const VarZodChecks: Record<VarTypes, z.ZodTypeAny> = {
  [VarTypes.String]: z.string(),
  [VarTypes.Number]: z.preprocess((val) => {
    if (typeof val === 'string') {
      const num = Number(val)
      return Number.isNaN(num) ? val : num
    }
    return val
  }, z.number()),
  [VarTypes.StringArray]: z.preprocess(tryParseJson, z.array(z.string())),
  [VarTypes.NumberArray]: z.preprocess(tryParseJson, z.array(z.number())),
}

export const ZodCheckComponentNodeMeta = z.object({
  type: z.enum(ComponentNodesEnum),
  vars: z.array(ZodCheckVar),
})
export type ComponentNodeMeta = z.infer<typeof ZodCheckComponentNodeMeta>
