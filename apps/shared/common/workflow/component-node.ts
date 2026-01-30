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

export const ZodCheckComponentNodeMeta = z.object({
  type: z.enum(ComponentNodesEnum),
  vars: z.array(ZodCheckVar),
})
export type ComponentNodeMeta = z.infer<typeof ZodCheckComponentNodeMeta>
