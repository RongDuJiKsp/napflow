import type { ComponentWithClass } from '@/utils/type'
import { Button, Tooltip } from '@heroui/react'
import { memo } from 'react'

const EditorOperatorItem = ({ title, onPress, Icon }: { title: string, onPress: () => void, Icon: ComponentWithClass }) => {
  return <Tooltip>
    <Button isIconOnly
      aria-label={title}
      className="h-10 w-10 border-gray-300 bg-white text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md"
      onPress={onPress}>
      <Icon />
    </Button>
    <Tooltip.Content>
      {title}
    </Tooltip.Content>
  </Tooltip>
}

export default memo(EditorOperatorItem)
