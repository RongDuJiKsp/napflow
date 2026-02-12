import z from 'zod'

// 比较操作符
export enum CompareOperator {
  StringEqual = 'string_equal', // 字符串等于
  StringNotEqual = 'string_not_equal', // 字符串不等于
  Contains = 'contains', // 包含
  ContainedBy = 'contained_by', // 包含于
  NotContains = 'not_contains', // 不包含
  NotContainedBy = 'not_contained_by', // 不包含于
  NumberGreaterThan = 'number_gt', // 转换为数值后大于
  NumberLessThan = 'number_lt', // 转换为数值后小于
  NumberNotLessThan = 'number_gte', // 转换为数值后不小于（大于等于）
  NumberNotGreaterThan = 'number_lte', // 转换为数值后不大于（小于等于）
}

export const CompareOperatorLabels: Record<CompareOperator, string> = {
  [CompareOperator.StringEqual]: '字符串等于',
  [CompareOperator.StringNotEqual]: '字符串不等于',
  [CompareOperator.Contains]: '包含',
  [CompareOperator.ContainedBy]: '包含于',
  [CompareOperator.NotContains]: '不包含',
  [CompareOperator.NotContainedBy]: '不包含于',
  [CompareOperator.NumberGreaterThan]: '数值大于',
  [CompareOperator.NumberLessThan]: '数值小于',
  [CompareOperator.NumberNotLessThan]: '数值不小于',
  [CompareOperator.NumberNotGreaterThan]: '数值不大于',
}

// 条件分支类型
export enum BranchType {
  If = 'if',
  ElseIf = 'else_if',
  Else = 'else',
}

// 单个条件
export const ConditionSchema = z.object({
  variable: z.string().min(1, '请选择一个变量'),
  operator: z.enum(CompareOperator),
  value: z.string().min(1, '请输入比较值'),
})
export type Condition = z.infer<typeof ConditionSchema>

// 单个分支
export const BranchSchema = z.object({
  id: z.string(), // 分支唯一ID，用于handle标识
  type: z.enum(BranchType),
  condition: ConditionSchema.optional(), // else分支没有条件
})
export type Branch = z.infer<typeof BranchSchema>

// raw object schema，不含 superRefine，供 server 端 extend 使用
export const IfDataRawSchema = z.object({
  branches: z.array(BranchSchema).min(1, '至少需要一个if条件'),
})

// if节点整体数据
export const IfDataSchema = IfDataRawSchema
  .superRefine((data, ctx) => {
    // 第一个必须是if
    if (data.branches[0]?.type !== BranchType.If) {
      ctx.addIssue({
        code: 'custom',
        message: '第一个分支必须是if条件',
        path: ['branches', 0],
      })
    }
    // else只能有一个且在最后
    const elseCount = data.branches.filter(b => b.type === BranchType.Else).length
    if (elseCount > 1) {
      ctx.addIssue({
        code: 'custom',
        message: '只能有一个else分支',
        path: ['branches'],
      })
    }
    if (elseCount === 1) {
      const lastBranch = data.branches[data.branches.length - 1]
      if (lastBranch?.type !== BranchType.Else) {
        ctx.addIssue({
          code: 'custom',
          message: 'else分支必须在最后',
          path: ['branches'],
        })
      }
    }
    // 非else分支必须有条件
    for (let i = 0; i < data.branches.length; i++) {
      const branch = data.branches[i]
      if (branch.type !== BranchType.Else && !branch.condition) {
        ctx.addIssue({
          code: 'custom',
          message: '条件不能为空',
          path: ['branches', i, 'condition'],
        })
      }
    }
  })

export type IfData = z.infer<typeof IfDataSchema>
