import { useEffect } from 'react'
import type { VarCtx } from '@workflow/editor/component-nodes/hooks/use-component-node-env'
import {
  $createEnvVarNode,
  $isEnvVarNode,
  LexEnvVarNode,
} from '../lex-nodes/env-var-node'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $dfs } from '@lexical/utils'

const EnvVarSyncPlugin = ({ envVars }: { envVars: VarCtx[] }) => {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    if (!editor.hasNode(LexEnvVarNode))
      throw new Error('EnvVarNodeReplacementPlugin: EnvVarNode not found')
  }, [editor])

  useEffect(() => {
    editor.update(() => {
      for (const envVarNode of $dfs()
        .filter(dfs => $isEnvVarNode(dfs.node))
        .map(dfs => dfs.node as LexEnvVarNode))
        envVarNode.replace($createEnvVarNode(envVarNode.getEnvVar(), envVars))
    })
  }, [envVars, editor])

  return null
}

export default EnvVarSyncPlugin
