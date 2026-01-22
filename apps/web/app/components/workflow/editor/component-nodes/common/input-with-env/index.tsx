import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useCreation } from 'ahooks'
import { memo } from 'react'
import { LexEnvVarNode } from './lex-nodes/env-var-node'
import type { VarCtx } from '../../hooks/use-component-node-env'
import LexicalParagraphControlledPlugin from '@/app/components/_base/lexical/plugins/LexicalControlledPlugin'
import EnvVarSyncPlugin from './lex-plugins/EnvVarSyncPlugin'
import EnvVarNodeReplacementPlugin from './lex-plugins/EnvVarNodeReplacementPlugin'
import EnvVarMenuPlugin from './lex-plugins/EnvVarMenuPlugin'
import { twMerge } from 'tailwind-merge'

const InputWithEnv = ({
  value,
  onChange,
  envs,
  className = {},
  isEditable,
  placeholder,
}: {
  envs: VarCtx[];
  value: string;
  onChange: (value: string) => void;
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
      <div className='relative'>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className={className.contentEditable} />
          }
          placeholder={<div className={twMerge('pointer-events-none absolute left-0 top-0 h-full w-full select-none flex justify-center items-center pl-1 text-gray-400', className.placeHolder)}>
            <div className='text-sm'>{placeholder}</div>
          </div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <LexicalParagraphControlledPlugin value={value} onChange={onChange}/>
      <EnvVarSyncPlugin envVars={envs} />
      <EnvVarNodeReplacementPlugin envVars={envs} />
      <EnvVarMenuPlugin envVars={envs} />
    </LexicalComposer>
  )
}
export default memo(InputWithEnv)
