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
      <div>
        <Label className="text-purple-700">回复内容</Label>
        <InputWithEnv envs={vars} value={data.content} onChange={handleContentChange}/>
      </div>
    </div>
  )
}

export default memo(ReplyPanel)
