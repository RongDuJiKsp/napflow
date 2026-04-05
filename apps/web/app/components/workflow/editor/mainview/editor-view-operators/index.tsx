'use client'
import { memo } from 'react'
import { ButtonGroup } from '@heroui/react'
import EditorOperatorItem from './EditorOperatorItem'
import { RiFocus3Line, RiGalleryView2 } from '@remixicon/react'
import { useEditorViewOperators } from './hooks/use-editor-view-operators'
const EditorViewOperators = () => {
  const { handleFocusOrigin, handleArrangeNodes } = useEditorViewOperators()
  return (
    <div className="absolute bottom-4 left-4 z-50">
      <ButtonGroup>
        <EditorOperatorItem title='聚焦原点' onPress={handleFocusOrigin} Icon={RiFocus3Line}/>
        <EditorOperatorItem title='整理节点' onPress={handleArrangeNodes} Icon={RiGalleryView2}/>
      </ButtonGroup>
    </div>
  )
}
export default memo(EditorViewOperators)
