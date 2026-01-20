import { LexReactNode, ReactDecoratorNode } from '@/app/components/_base/lexical/utils/reactful'
import type { VarCtx } from '../../../hooks/use-component-node-env'
import type { JSX } from 'react'
import type { LexicalNode, NodeKey } from 'lexical'

type EnvVarNodeProps = {
  envVar: VarCtx;
  nodeMap: Record<string, VarCtx[]>;
}

const EnvVarNode = ({}: EnvVarNodeProps) => {
  return <div>EnvVarNode</div>
}

class LexReactEnvVarNode extends LexReactNode<EnvVarNodeProps> {
  decorate(): JSX.Element {
    return <EnvVarNode {...this.props} />
  }
}

export class LexEnvVarNode extends ReactDecoratorNode<LexReactEnvVarNode> {
  static getType(): string {
    return 'env-var'
  }

  static clone(_data: LexEnvVarNode): LexicalNode {
    return new LexEnvVarNode(_data.__reactProps, _data.__key)
  }

  constructor(props: EnvVarNodeProps, key?: NodeKey) {
    super(new LexReactEnvVarNode(props), key)
  }
}
