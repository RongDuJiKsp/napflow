import type { TextNode } from 'lexical'
import { uniq } from 'lodash-es'

/**
 * 在文本节点中分割文本
 * @param node 文本节点
 * @param regExp 正则表达式
 * @returns 分割后的文本节点
 */
export const $splitTextNode = (node: TextNode, regExp: RegExp) => {
  const textContent = node.getTextContent()
  const matches: number[] = []

  // 创建正则表达式的副本，避免修改原始对象的状态
  const regExpCopy = new RegExp(regExp.source, `${regExp.flags.includes('g') ? '' : 'g'}${regExp.flags}`)

  // 找到所有匹配的位置
  let match
  while ((match = regExpCopy.exec(textContent)) !== null) {
    // 添加匹配开始位置
    matches.push(match.index)
    // 添加匹配结束位置
    matches.push(match.index + match[0].length)
  }

  // 去重并排序
  const uniqueOffsets = uniq(matches).sort((a, b) => a - b)

  // 如果没有匹配项，返回原节点
  if (uniqueOffsets.length === 0)
    return [node]

  // 在找到的位置分割文本节点
  return node.splitText(...uniqueOffsets)
}
