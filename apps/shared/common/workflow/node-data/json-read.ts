import z from 'zod'
import { VarTypes } from '../core/component-node'

export const JsonReadOutputBindingSchema = z.object({
  name: z.string().min(1, '输出变量名不能为空'),
  field: z.string().min(1, '绑定字段不能为空'),
  type: z.enum(VarTypes).default(VarTypes.String),
})

export type JsonReadOutputBinding = z.infer<typeof JsonReadOutputBindingSchema>

export const JsonReadDataSchema = z
  .object({
    sourceVarName: z.string().min(1, '请选择一个字符串变量'),
    outputs: z.array(JsonReadOutputBindingSchema),
  })
  .superRefine((data, ctx) => {
    const names = new Set<string>()
    data.outputs.forEach((item, index) => {
      if (names.has(item.name)) {
        ctx.addIssue({
          code: 'custom',
          message: '输出变量名不能重复',
          path: ['outputs', index, 'name'],
        })
        return
      }
      names.add(item.name)
    })
  })

export type JsonReadData = z.infer<typeof JsonReadDataSchema>
