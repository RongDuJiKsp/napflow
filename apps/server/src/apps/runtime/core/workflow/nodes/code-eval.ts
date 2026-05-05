import { ZodCheckComponentNodeDataTag } from '@shared/common/workflow/core/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import {
  CodeEvalDataSchema,
  JsValueTransform,
} from '@shared/common/workflow/node-data/code-eval'
import type { CodeEvalWorkerParams } from '../workers/code-eval'
import Piscina from 'piscina'
import path from 'node:path'

export const CodeEvalDataCtxSchema = ZodCheckComponentNodeDataTag.extend(
  CodeEvalDataSchema.shape,
)

export type CodeEvalDataCtx = z.infer<typeof CodeEvalDataCtxSchema>

const pool = new Piscina<CodeEvalWorkerParams, string>({
  filename: path.resolve(__dirname, '../workers', 'code-eval.js'),
})

export class CodeEvalNode extends CommNode<CodeEvalDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action

  constructor(data: CommNodeType<CodeEvalDataCtx>) {
    super(data)
  }

  async onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    nkv: Record<string, any>,
  ): Promise<void> {
    const evalFuncArgs = this.data.args.map(arg =>
      JsValueTransform[arg.transJsValueType](
        thread.compileEnvTemplate(arg.kvTarget),
      ),
    )
    const result = await pool.run({
      declareCode: this.data.code,
      dynamicArgs: evalFuncArgs,
      execFuncName: 'doit',
    })
    nkv.result = result
  }
}
