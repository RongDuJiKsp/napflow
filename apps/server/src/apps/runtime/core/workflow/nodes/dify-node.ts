import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { DifyDataSchema, DifyMode } from '@shared/common/workflow/node-data/dify'
import { compileTemplate } from '../../../utils/templates'
import { Logger } from '@nestjs/common'

export const DifyDataCtxSchema = ZodCheckComponentNodeMeta.extend(
  DifyDataSchema.shape,
)

export type DifyDataCtx = z.infer<typeof DifyDataCtxSchema>

export class DifyNode extends CommNode<DifyDataCtx> {
  readonly role: CommNodeRole = CommNodeRole.Action
  readonly logger = new Logger(DifyNode.name)

  constructor(data: CommNodeType<DifyDataCtx>) {
    super(data)
  }

  async onThread(
    thread: WorkflowThread,
    _nextTask: WillTask,
    nkv: Record<string, any>,
  ): Promise<void> {
    const baseUrl = compileTemplate(this.data.baseUrl, thread)
    const apiKey = compileTemplate(this.data.apiKey, thread)
    const query = this.data.query ? compileTemplate(this.data.query, thread) : ''

    this.logger.debug(`Calling Dify API [${this.data.mode}], baseUrl: ${baseUrl}, query: ${query}`)

    const base = baseUrl.replace(/\/$/, '')
    const isChatflow = this.data.mode === DifyMode.Chatflow
    const url = isChatflow
      ? `${base}/chat-messages`
      : `${base}/workflows/run`

    const compiledInputs: Record<string, string> = {}
    for (const entry of this.data.inputs ?? [])
      compiledInputs[entry.key] = compileTemplate(entry.value, thread)

    const bodyObj = isChatflow
      ? { inputs: {}, query, response_mode: 'blocking', conversation_id: '', user: 'napflow' }
      : { inputs: compiledInputs, response_mode: 'blocking', user: 'napflow' }

    let answer: string
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyObj),
      })
      if (!resp.ok) {
        const errText = await resp.text()
        this.logger.error(`Dify API error ${resp.status}: ${errText}`)
        answer = ''
      }
      else if (isChatflow) {
        const json = await resp.json() as { answer?: string }
        answer = json.answer ?? ''
      }
      else {
        const json = await resp.json() as { data?: { outputs?: unknown } }
        answer = JSON.stringify(json.data?.outputs ?? null)
      }
    }
    catch (e) {
      this.logger.error(`Dify API request failed: ${String(e)}`)
      answer = ''
    }

    this.logger.debug(`Dify answer: ${answer}`)
    nkv.output = answer
  }
}
