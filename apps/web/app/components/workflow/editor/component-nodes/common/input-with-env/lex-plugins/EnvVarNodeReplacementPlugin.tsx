import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'
import { $transformEnvVarNode, LexEnvVarNode } from '../lex-nodes/env-var-node'
import { mergeRegister } from '@lexical/utils'
import { TextNode } from 'lexical'
import type { VarCtx } from '../../../hooks/use-component-node-env'

/**
 * @description 将脏文本节点尝试解析为环境变量节点
 */
const EnvVarNodeReplacementPlugin = ({ envVars }: { envVars: VarCtx[] }) => {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    if (!editor.hasNode(LexEnvVarNode))
      throw new Error('EnvVarNodeReplacementPlugin: EnvVarNode not found')
  }, [editor])

  useEffect(() => {
    return mergeRegister(
      editor.registerNodeTransform(TextNode, (node: TextNode) => {
        $transformEnvVarNode(node, envVars)
      }),
    )
  }, [editor, envVars])
  return null
}

export default EnvVarNodeReplacementPlugin
