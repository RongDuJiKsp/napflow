export enum TemplatePart {
  Text = 'text',
  Var = 'var',
}
export type TemplatePartItem
  = | { type: TemplatePart.Text; text: string }
  | { type: TemplatePart.Var; payload: string }

export const splitTemplateVars = (template: string): TemplatePartItem[] => {
  if (!template) return []

  const regex = /\{\{#([^#]+)#\}\}/g
  const matches = Array.from(template.matchAll(regex))

  // 使用 reduce 一次性处理所有匹配项
  const result = matches.reduce<{
    items: TemplatePartItem[];
    lastIndex: number;
  }>(
    (acc, match) => {
      // 添加变量前的文本部分
      if (match.index! > acc.lastIndex) {
        acc.items.push({
          type: TemplatePart.Text,
          text: template.slice(acc.lastIndex, match.index),
        })
      }

      // 添加变量部分
      acc.items.push({ type: TemplatePart.Var, payload: match[1] })

      acc.lastIndex = match.index! + match[0].length
      return acc
    },
    { items: [], lastIndex: 0 },
  )
  // 添加最后剩余的文本部分
  if (result.lastIndex < template.length) {
    result.items.push({
      type: TemplatePart.Text,
      text: template.slice(result.lastIndex),
    })
  }

  return result.items
}
