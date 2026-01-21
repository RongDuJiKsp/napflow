import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback, useEffect } from 'react'
import { $createEnvVarNodeFromRaw, EnvVarRegex, LexEnvVarNode } from '../lex-nodes/env-var-node'
import { mergeRegister } from '@lexical/utils'
import { TextNode } from 'lexical'
import { $splitTextNode } from '@/app/components/_base/lexical/utils/common'
import type { VarCtx } from '../../../hooks/use-component-node-env'

/**
* @description 将脏文本节点尝试解析为环境变量节点
 */
const EnvVarNodeReplacementPlugin = ({ envVars}: { envVars: VarCtx[] }) => {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    if (!editor.hasNode(LexEnvVarNode))
      throw new Error('EnvVarNodeReplacementPlugin: EnvVarNode not found')
  }, [editor])

  const $nodeTransform = useCallback((node: TextNode) => {
    const splitedNodes = $splitTextNode(node, EnvVarRegex)
    // 白切了
    if(splitedNodes.length === 1)
      return

    for(const splitedNode of splitedNodes) {
      if(!EnvVarRegex.test(splitedNode.getTextContent()))
        continue
      splitedNode.replace($createEnvVarNodeFromRaw(splitedNode.getTextContent(), envVars))
    }
  }, [envVars])

  useEffect(() => {
    return mergeRegister(
      editor.registerNodeTransform(TextNode, $nodeTransform),
    )
  }, [editor, $nodeTransform])
  return null
}

export default EnvVarNodeReplacementPlugin
