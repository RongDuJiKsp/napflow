import type { WorkflowThread } from '../core/workflow/pool'
import type { Class } from 'type-fest'

export const raiseErrors = <T>(thread: WorkflowThread, klass: Class<T>) => {
  thread.logger.warn(`运行了未被重写的节点：${klass.name}`)
}
