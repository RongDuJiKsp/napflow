import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { ReplyData } from './creator'
import { Label } from '@heroui/react'
import InputWithEnv from '../../common/input-with-env'
import { useReplyCurd } from './hooks/use-reply-curd'

const ReplyPanel: ComponentPanelFc<ReplyData> = ({ id, data }) => {
  const { vars, handleContentChange } = useReplyCurd(id)

  return (
    <div>
      <div className="flex flex-col gap-4">
        <Label className="text-purple-700">回复内容</Label>
        <InputWithEnv
          className={{
            contentEditable: 'text-md min-h-30 border border-purple-500 rounded-sm focus:border-purple-700 p-2',
          }}
          envs={vars}
          value={data.content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  )
}

export default memo(ReplyPanel)
