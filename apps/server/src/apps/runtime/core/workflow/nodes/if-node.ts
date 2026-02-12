import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { raiseErrors } from '../../../utils/errors'

// 比较操作符
export enum CompareOperator {
  StringEqual = 'string_equal',
  Contains = 'contains',
  ContainedBy = 'contained_by',
  NotContains = 'not_contains',
  NotContainedBy = 'not_contained_by',
  NumberGreaterThan = 'number_gt',
  NumberLessThan = 'number_lt',
  NumberNotLessThan = 'number_gte',
  NumberNotGreaterThan = 'number_lte',
}

// 条件分支类型
export enum BranchType {
  If = 'if',
  ElseIf = 'else_if',
  Else = 'else',
}

const ConditionSchema = z.object({
  variable: z.string(),
  operator: z.enum(CompareOperator),
  value: z.string(),
})

const BranchSchema = z.object({
  id: z.string(),
  type: z.enum(BranchType),
  condition: ConditionSchema.optional(),
})

export const IfDataSchema = ZodCheckComponentNodeMeta.extend({
  branches: z.array(BranchSchema).min(1),
})

export type IfData = z.infer<typeof IfDataSchema>

export class IfNode extends CommNode<IfData> {
  readonly role: CommNodeRole = CommNodeRole.Action

  constructor(data: CommNodeType<IfData>) {
    super(data)
  }

  onThread(thread: WorkflowThread, _nextTask: WillTask, _nkv: Record<string, any>): void | Promise<void> {
    // TODO: 实现条件分支的运行时逻辑
    raiseErrors(thread, IfNode)
  }
}
