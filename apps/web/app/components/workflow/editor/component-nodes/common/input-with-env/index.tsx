import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useCreation } from 'ahooks'
import { memo } from 'react'
import { LexEnvVarNode } from './lex-nodes/env-var-node'
import type { VarCtx } from '../../hooks/use-component-node-env'

const InputWithEnv = ({
  className = {},
  isEditable,
  placeholder,
}: {
  envs: VarCtx[];
  className?: { contentEditable?: string; placeHolder?: string };
  isEditable?: boolean;
  placeholder?: string;
}) => {
  const initConfig = useCreation<InitialConfigType>(
    () => ({
      namespace: 'input-with-env',
      onError: (error) => {
        throw error
      },
      editable: isEditable,
      nodes: [
        LexEnvVarNode,
      ],
    }),
    [isEditable],
  )
  return (
    <LexicalComposer initialConfig={initConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable className={className.contentEditable} />
        }
        placeholder={<div className={className.placeHolder}>{placeholder}</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </LexicalComposer>
  )
}
export default memo(InputWithEnv)
