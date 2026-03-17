import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { ArrayIndexReadDataSchema } from '@shared/common/workflow/node-data/array-index-read'

export const ArrayIndexReadDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  ArrayIndexReadDataSchema.shape,
)

export type ArrayIndexReadDataCtx = z.infer<typeof ArrayIndexReadDataCtxSchema>

export class ArrayIndexReadNode extends CommNode<ArrayIndexReadDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action

  constructor(data: CommNodeType<ArrayIndexReadDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    nkv: Record<string, any>,
  ): void | Promise<void> {
    const sourceVarName = this.data.sourceVarName.trim()
    const rawIndex = thread.compileEnvTemplate(this.data.index).trim()

    if (!sourceVarName || !rawIndex) return

    const [sourceNodeId, ...sourceFieldParts] = sourceVarName.split('.')
    if (!sourceNodeId || sourceFieldParts.length === 0) return

    const sourceField = sourceFieldParts.join('.')
    const sourceRaw = thread.nodeKv[sourceNodeId]?.[sourceField]
    if (!Array.isArray(sourceRaw)) return

    const index = Number(rawIndex)
    if (!Number.isInteger(index) || index < 0) return

    nkv.value = sourceRaw[index]
  }
}
