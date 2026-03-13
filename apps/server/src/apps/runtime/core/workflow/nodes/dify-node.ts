import { ZodCheckComponentNodeMeta } from '@shared/common/workflow/component-node'
import type z from 'zod'
import type { CommNodeType } from '../node'
import { CommNode, CommNodeRole } from '../node'
import type { WorkflowThread } from '../pool'
import type { WillTask } from '@/src/utils/task-pool'
import { DifyDataSchema } from '@shared/common/workflow/node-data/dify'
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
    const query = compileTemplate(this.data.query, thread)

    this.logger.debug(`Calling Dify API, baseUrl: ${baseUrl}, query: ${query}`)

    const url = `${baseUrl.replace(/\/$/, '')}/v1/chat-messages`
    let answer: string
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {},
          query,
          response_mode: 'blocking',
          user: 'napflow',
        }),
      })
      if (!resp.ok) {
        const errText = await resp.text()
        this.logger.error(`Dify API error ${resp.status}: ${errText}`)
        answer = ''
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
