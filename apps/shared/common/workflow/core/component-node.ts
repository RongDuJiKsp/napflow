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
