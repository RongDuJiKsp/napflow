import z from 'zod'
import { VarTypes } from '../core/component-node'
import { defineTypedRecord } from '@shared/utils/ts-utils'
import { tryParseJson } from '@shared/utils/zod-transfer'
import { tryit } from 'radash'
import { parse } from 'acorn'

export const CodeEvalArgsSchema = z.object({
  kvTarget: z.string(),
  transJsValueType: z.enum(VarTypes),
})
export type CodeEvalArgs = z.infer<typeof CodeEvalArgsSchema>

export const JsValueTransform = defineTypedRecord<Record<VarTypes, (from: unknown) => unknown>>({
  [VarTypes.String]: from => String(from),
  [VarTypes.Number]: from => Number(from),
  [VarTypes.StringArray]: (from) => {
    if (typeof from === 'string') {
      const tryParsed = tryParseJson(from)
      if(Array.isArray(tryParsed))
        return tryParsed.map(String)
    }

    if (Array.isArray(from))
      return from.map(String)

    return [String(from)]
  },
  [VarTypes.NumberArray]: (from) => {
    if (typeof from === 'string') {
      const tryParsed = tryParseJson(from)
      if(Array.isArray(tryParsed))
        return tryParsed.map(Number)
    }

    if (Array.isArray(from))
      return from.map(Number)

    return [Number(from)]
  },
})

export const CodeEvalDataSchema = z.object({
  code: z.string().min(1, '请输入要执行的代码'),
  args: z.array(CodeEvalArgsSchema),
}).superRefine((data, ctx) => {
  const [parseErr] = tryit(() => parse(data.code, { ecmaVersion: 6 }))()
  if(parseErr) {
    ctx.addIssue({
      code: 'custom',
      message: `代码存在语法错误：${parseErr.message}`,
      fatal: true,
    })
  }
})
export type CodeEvalData = z.infer<typeof CodeEvalDataSchema>
