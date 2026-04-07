import { ZodCheckComponentNodeDataTag } from '@shared/common/workflow/core/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { JsonReadDataSchema } from '@shared/common/workflow/node-data/json-read'
import { VarTypes } from '@shared/common/workflow/core/component-node'

export const JsonReadDataCtxSchema = ZodCheckComponentNodeDataTag.extend(
  JsonReadDataSchema.shape,
)

export type JsonReadDataCtx = z.infer<typeof JsonReadDataCtxSchema>

export class JsonReadNode extends CommNode<JsonReadDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action

  constructor(data: CommNodeType<JsonReadDataCtx>) {
    super(data)
  }

  onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    nkv: Record<string, any>,
  ): void | Promise<void> {
    const sourceVarName = this.data.sourceVarName.trim()
    if (!sourceVarName) return

    const [sourceNodeId, ...sourceFieldParts] = sourceVarName.split('.')
    if (!sourceNodeId || sourceFieldParts.length === 0) return

    const sourceField = sourceFieldParts.join('.')
    const sourceRaw = thread.nodeKv[sourceNodeId]?.[sourceField]
    if (sourceRaw == null) return

    let sourceJson: Record<string, unknown> | null = null
    if (typeof sourceRaw === 'string') {
      try {
        const parsed = JSON.parse(sourceRaw)
        if (typeof parsed === 'object' && parsed !== null)
          sourceJson = parsed as Record<string, unknown>
      }
      catch {
        sourceJson = null
      }
    }
    else if (typeof sourceRaw === 'object' && sourceRaw !== null) {
      sourceJson = sourceRaw as Record<string, unknown>
    }
    if (!sourceJson) return

    const serializeString = (value: unknown): string => {
      if (value == null) return ''
      if (typeof value === 'string') return value
      if (typeof value === 'number' || typeof value === 'boolean')
        return String(value)
      try {
        return JSON.stringify(value)
      }
      catch {
        return ''
      }
    }

    const serializeNumber = (value: unknown): number => {
      if (typeof value === 'number') return Number.isFinite(value) ? value : 0
      const fromString = Number(serializeString(value))
      return Number.isFinite(fromString) ? fromString : 0
    }

    const serializeStringArray = (value: unknown): string[] => {
      if (Array.isArray(value))
        return value.map(item => serializeString(item))
      return value == null ? [] : [serializeString(value)]
    }

    const serializeNumberArray = (value: unknown): number[] => {
      if (Array.isArray(value))
        return value.map(item => serializeNumber(item))
      return value == null ? [] : [serializeNumber(value)]
    }

    for (const output of this.data.outputs) {
      const name = output.name.trim()
      const field = output.field.trim()
      if (!name || !field) continue
      const value = sourceJson[field]
      const targetType = output.type || VarTypes.String
      if (targetType === VarTypes.Number) {
        nkv[name] = serializeNumber(value)
        continue
      }
      if (targetType === VarTypes.StringArray) {
        nkv[name] = serializeStringArray(value)
        continue
      }
      if (targetType === VarTypes.NumberArray) {
        nkv[name] = serializeNumberArray(value)
        continue
      }

      nkv[name] = serializeString(value)
    }
  }
}
