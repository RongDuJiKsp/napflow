import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { CompareOperator } from '@shared/common/workflow/node-data/if'
import { IfDataSchema } from '@shared/common/workflow/node-data/if'

// 使用 MetaSchema.extend(sharedSchema) 做兼容
export const IfDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  IfDataSchema.shape,
)

export type IfDataCtx = z.infer<typeof IfDataCtxSchema>

export const OperatorChecker: Record<
  CompareOperator,
  (a: unknown, b: unknown) => boolean
> = {
  // 字符串等于
  [CompareOperator.StringEqual]: (a: unknown, b: unknown): boolean =>
    String(a) === String(b),
  // 字符串不等于
  [CompareOperator.StringNotEqual]: (a: unknown, b: unknown): boolean =>
    String(a) !== String(b),
  // a 包含 b
  [CompareOperator.Contains]: (a: unknown, b: unknown): boolean =>
    String(a).includes(String(b)),
  // a 被 b 包含（即 b 包含 a）
  [CompareOperator.ContainedBy]: (a: unknown, b: unknown): boolean =>
    String(b).includes(String(a)),
  // a 不包含 b
  [CompareOperator.NotContains]: (a: unknown, b: unknown): boolean =>
    !String(a).includes(String(b)),
  // a 不被 b 包含（即 b 不包含 a）
  [CompareOperator.NotContainedBy]: (a: unknown, b: unknown): boolean =>
    !String(b).includes(String(a)),
  // 数值大于
  [CompareOperator.NumberGreaterThan]: (a: unknown, b: unknown): boolean =>
    Number(a) > Number(b),
  // 数值小于
  [CompareOperator.NumberLessThan]: (a: unknown, b: unknown): boolean =>
    Number(a) < Number(b),
  // 数值不小于（大于等于）
  [CompareOperator.NumberNotLessThan]: (a: unknown, b: unknown): boolean =>
    Number(a) >= Number(b),
  // 数值不大于（小于等于）
  [CompareOperator.NumberNotGreaterThan]: (a: unknown, b: unknown): boolean =>
    Number(a) <= Number(b),
}

export class IfNode extends CommNode<IfDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action

  constructor(data: CommNodeType<IfDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    _nkv: Record<string, any>,
  ): void | Promise<void> {
    const branchEdges = thread.plugin.edges.filter(
      edge => edge.source === this.id,
    )
    const needToDeleteQueues = new Set<string>(
      branchEdges.map(edge => edge.target),
    )
    for (const branch of this.data.branches) {
      const branchEdge = branchEdges.find(
        edge => edge.sourceHandle === branch.id,
      )
      // 没有对应的边 不管
      if (!branchEdge) continue
      // 没有condition为else 结束
      if (!branch.condition) {
        needToDeleteQueues.delete(branchEdge.target)
        break
      }
      //
      const [varNodeIndex, ...varNames] = branch.condition.variable.split('.')
      const value = thread.nodeKv[varNodeIndex][varNames.join('.')]
      const conditionValue = thread.compileEnvTemplate(branch.condition.value)
      // 判断条件是否成立
      // 如果成立 则执行对应的边
      if (OperatorChecker[branch.condition.operator](value, conditionValue)) {
        needToDeleteQueues.delete(branchEdge.target)
        break
      }
    }
    // 删除不需要执行的节点
    thread.graphRunner.removeQueue(Array.from(needToDeleteQueues))
  }
}
