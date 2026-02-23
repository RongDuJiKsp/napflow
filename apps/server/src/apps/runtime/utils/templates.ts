import { TemplatePart, splitTemplateVars } from '@/src/utils/template'
import type { WorkflowThread } from '../core/workflow/pool'

export const compileTemplate = (
  template: string,
  kvLocal: WorkflowThread,
): string => {
  return splitTemplateVars(template)
    .map((item) => {
      if (item.type === TemplatePart.Text) return item.text

      if (item.type === TemplatePart.Var) {
        const [nodeId, ...namespaces] = item.payload.split('.')
        return String(kvLocal.nodeKv[nodeId][namespaces.join('.')])
      }
      return ''
    })
    .join('')
}
