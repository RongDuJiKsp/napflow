import type { SerializedEditorState } from 'lexical'
import { $getRoot } from 'lexical'

// 段落之间以\n分隔
export type LexParagraphs = string

// utils
/**
 * 将段落字符串转换为编辑器状态
 * @param paragraphsStr 段落字符串
 * @returns 编辑器状态
 */
const paragraphs2EditorState = (
  paragraphsStr: LexParagraphs,
): SerializedEditorState => {
  const paragraph = paragraphsStr.split('\n')
  return {
    root: {
      children: paragraph.map((p) => {
        return {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: p,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        }
      }),
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}
/**
 * 将段落字符串转换为编辑器状态字符串
 * @param paragraphsStr 段落字符串
 * @returns 编辑器状态字符串
 */
const paragraphs2EditorStateStr = (paragraphsStr: LexParagraphs): string => {
  return JSON.stringify(paragraphs2EditorState(paragraphsStr))
}

// commands
/**
 * 获取编辑器的文本内容
 * @returns 编辑器文本内容
 */
const $getParagraphTextContent = (): LexParagraphs => {
  return $getRoot()
    .getChildren()
    .map(node => node.getTextContent())
    .join('\n')
}

/**
 * lexParagraph提供了一组方法 这些方法将lexical视为 root-paragraph-items(text/var)的简单三层结构 较为简洁
 */
export const lexParagraph = {
  $getParagraphTextContent,
  paragraphs2EditorState,
  paragraphs2EditorStateStr,
}
