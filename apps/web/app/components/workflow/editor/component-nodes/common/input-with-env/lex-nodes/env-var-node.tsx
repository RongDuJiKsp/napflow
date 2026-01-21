import type { SerializedLexicalReactNode } from '@/app/components/_base/lexical/utils/reactful'
import { LexReactNode, ReactDecoratorNode } from '@/app/components/_base/lexical/utils/reactful'
import type { VarCtx, VarCtxName } from '../../../hooks/use-component-node-env'
import type { JSX } from 'react'
import type { LexicalNode, NodeKey } from 'lexical'

type EnvVarNodeProps = {
  envVar: VarCtxName;
  envs: VarCtx[];
}

const EnvVarNode = ({}: EnvVarNodeProps) => {
  return <div>EnvVarNode</div>
}

class LexReactEnvVarNode extends LexReactNode<EnvVarNodeProps> {
  decorate(): JSX.Element {
    return <EnvVarNode {...this.props} />
  }

  textContent(): string {
    return `{{#${this.props.envVar}#}}`
  }
}

export class LexEnvVarNode extends ReactDecoratorNode<EnvVarNodeProps, LexReactEnvVarNode> {
  static getType(): string {
    return 'env-var'
  }

  static clone(_data: LexEnvVarNode): LexicalNode {
    return new LexEnvVarNode(_data.__reactProps, _data.__key)
  }

  static importJSON(serializedNode: SerializedLexicalReactNode<EnvVarNodeProps>): LexicalNode {
    return new LexEnvVarNode(serializedNode.reactProps)
  }

  constructor(props: EnvVarNodeProps, key?: NodeKey) {
    super(new LexReactEnvVarNode(props), key)
  }

  exportJSON(): SerializedLexicalReactNode<EnvVarNodeProps> {
    return {
      ...super.exportJSON(),
      type: LexEnvVarNode.getType(),
    }
  }

  $this(): LexEnvVarNode {
    return this.getLatest()
  }

  getEnvVar(): VarCtxName {
    return this.$this().__reactProps.envVar
  }

  getEnvVars(): VarCtx[] {
    return this.$this().__reactProps.envs
  }
}

// 匹配规则   {{#nodeId.envVar#}}. 其中nodeId匹配 [a-zA-Z0-9_@-] envVar为 点分且首字符不以数字开头
export const EnvVarRegex = /\{\{(#[a-zA-Z0-9_@-]{1,50}(\.[a-zA-Z_][\w]{0,29}){1,10}#)\}\}/gi

/**
 * @param envVar 变量名称 即 nodeId.foo.bar
 * @param envs  环境变量列表
 * @returns node
*/
export const $createEnvVarNode = (envVar: VarCtxName, envs: VarCtx[]) => {
  return new LexEnvVarNode({
    envVar,
    envs,
  })
}

/**
 *
 * @param raw 带模板的名称 即 {{#nodeId.foo.bar#}}
 * @param envs 环境变量列表
 * @returns node
 */
export const $createEnvVarNodeFromRaw = (raw: string, envs: VarCtx[]) => {
  const varCtxName = raw.slice(3, -3)
  return $createEnvVarNode(varCtxName, envs)
}

export const $isEnvVarNode = (node: LexicalNode) => {
  return node instanceof LexEnvVarNode
}
