import { type PropsWithChildren, memo, useMemo } from 'react'
import { NodeEnvContext, getNodeEnvMap } from '../hooks/use-component-node-env'
import { useComponentNodeEdges } from '../hooks/use-component-node-curd'

const ComponentNodeEnvProvider = ({ children }: PropsWithChildren) => {
  const { nodes, edges } = useComponentNodeEdges()
  const envCtx = useMemo(() => {
    return getNodeEnvMap(nodes, edges)
  }, [nodes, edges])
  return (
    <NodeEnvContext.Provider value={envCtx}>{children}</NodeEnvContext.Provider>
  )
}

export default memo(ComponentNodeEnvProvider)
