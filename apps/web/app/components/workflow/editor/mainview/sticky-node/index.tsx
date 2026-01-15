import { useViewport } from '@xyflow/react'
import { useStickyEventsRegister, useStickyNode } from './hooks/use-sticky-node'

export const StickyNode = () => {
  const { StickyElement, stickyElementProps, stickyLocation } = useStickyNode()
  const { zoom } = useViewport()
  useStickyEventsRegister()
  if (!StickyElement || !stickyElementProps || !stickyLocation) return null
  return (
    <div
      className="absolute z-10 pointer-events-none"
      style={{
        left: stickyLocation.x,
        top: stickyLocation.y,
        transform: `scale(${zoom})`,
        transformOrigin: '0 0',
      }}
    >
      <StickyElement {...stickyElementProps} />
    </div>
  )
}
