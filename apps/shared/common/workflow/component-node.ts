import z from 'zod'

// component nodes
export enum ComponentNodesEnum {
  Trigger = 'trigger',
  Reply = 'reply',
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

export const VarZodChecks: Record<VarTypes, z.ZodTypeAny> = {
  [VarTypes.String]: z.string(),
  [VarTypes.Number]: z.preprocess(val => Number(val), z.number()),
  [VarTypes.StringArray]: z.preprocess(val => JSON.parse(String(val)), z.array(z.string())),
  [VarTypes.NumberArray]: z.preprocess(val => JSON.parse(String(val)), z.array(z.number())),
}

export const ZodCheckComponentNodeMeta = z.object({
  type: z.enum(ComponentNodesEnum),
  vars: z.array(ZodCheckVar),
})
export type ComponentNodeMeta = z.infer<typeof ZodCheckComponentNodeMeta>
