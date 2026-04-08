import type { ZodRawShape } from 'zod'
import z from 'zod'
import { tryParseJson } from '@shared/utils/zod-transfer'
// component nodes
export enum ComponentNodesEnum {
  Trigger = 'trigger',
  Timer = 'timer',
  Reply = 'reply',
  If = 'if',
  Loop = 'loop',
  LoopStart = 'loop-start',
  Iterate = 'iterate',
  IterateStart = 'iterate-start',
  Dify = 'dify',
  JsonRead = 'json-read',
  ArrayIndexRead = 'array-index-read',
}

// x-start 节点只能作为 x 节点的子节点被自动创建，不出现在菜单中
export const hiddenNodeTypes = new Set<ComponentNodesEnum>([
  ComponentNodesEnum.LoopStart,
  ComponentNodesEnum.IterateStart,
])

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

// meta

export const ZodCheckComponentNodeDataTag = z.object({
  type: z.enum(ComponentNodesEnum),
  vars: z.array(ZodCheckVar),
})
export type ComponentNodeDataTag = z.infer<typeof ZodCheckComponentNodeDataTag>

export const ZodCheckComponentNodeDataExtra = z.object({
  title: z.string(),
  desc: z.string(),
})
export type ComponentNodeDataExtra = z.infer<
  typeof ZodCheckComponentNodeDataExtra
>

export const ZodCheckComponentNodeDataMeta
  = ZodCheckComponentNodeDataTag.extend(ZodCheckComponentNodeDataExtra.shape)
export type ComponentNodeDataMeta = z.infer<
  typeof ZodCheckComponentNodeDataMeta
>

// export
export const defineZodCheckComponentNodeData = <
  S extends ZodRawShape,
  T extends z.ZodObject<S>,
>(
  data: T,
) => ZodCheckComponentNodeDataMeta.extend(data.shape)
export type ComponentNodeData<T = unknown> = ComponentNodeDataMeta & T
