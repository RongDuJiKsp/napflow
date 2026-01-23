import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useCallback, useEffect, useState } from 'react'
import type { EditorState } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $dfs } from '@lexical/utils'
import { lexParagraph } from '../utils/lex-paragraph'
const LexicalParagraphControlledPlugin = ({
  value,
  onChange,
}: {
  value: string;
  onChange?: (textState: string) => void;
}) => {
  const [editor] = useLexicalComposerContext()

  const [flushFlag, setFlushFlag] = useState(false)

  const handleChange = useCallback(
    (editorState: EditorState) => {
      setFlushFlag(pre => !pre)
      onChange?.(
        editorState.read(() => lexParagraph.$getParagraphTextContent()),
      )
    },
    [onChange],
  )

  useEffect(() => {
    // fix: call flushSync in micro task
    Promise.resolve().then(() => {
      const originState = editor.read(() => {
        return lexParagraph.$getParagraphTextContent()
      })
      if (originState === value) return
      const stateJSON = lexParagraph.paragraphs2EditorStateStr(value || '')
      const state = editor.parseEditorState(stateJSON)
      editor.setEditorState(state, { tag: 'programmatic' })
      // 将所有节点标记为dirty触发重新渲染
      editor.update(() => {
        for (const node of $dfs()) node.node.getLatest().markDirty()
      })
    })
  }, [editor, value, flushFlag])
  return <OnChangePlugin onChange={handleChange} />
}

export default LexicalParagraphControlledPlugin
