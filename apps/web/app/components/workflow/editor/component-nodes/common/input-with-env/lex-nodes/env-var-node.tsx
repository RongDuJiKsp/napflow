import type { SerializedLexicalReactNode } from '@/app/components/_base/lexical/utils/reactful'
import {
  LexReactNode,
  ReactDecoratorNode,
} from '@/app/components/_base/lexical/utils/reactful'
import {
  type VarCtx,
  type VarCtxName,
  getCommVarCtxName,
} from '../../../hooks/use-component-node-env'
import { VarTypes } from '../../../types'
import { twMerge } from 'tailwind-merge'
import type { JSX } from 'react'
import type { LexicalNode, NodeKey } from 'lexical'

type EnvVarNodeProps = {
  envVar: VarCtxName;
  envs: VarCtx[];
}

const typeColors: Record<VarTypes, string> = {
  [VarTypes.String]: 'bg-blue-100 text-blue-700',
  [VarTypes.Number]: 'bg-green-100 text-green-700',
  [VarTypes.StringArray]: 'bg-purple-100 text-purple-700',
  [VarTypes.NumberArray]: 'bg-pink-100 text-pink-700',
}

const typeLabels: Record<VarTypes, string> = {
  [VarTypes.String]: 'String',
  [VarTypes.Number]: 'Number',
  [VarTypes.StringArray]: 'StringArray',
  [VarTypes.NumberArray]: 'NumberArray',
}

const EnvVarNode = ({ envVar, envs }: EnvVarNodeProps) => {
  // 检查变量是否存在于环境变量列表中
  const availableVarNames = envs.map(getCommVarCtxName)
  const foundVar = envs.find(env => getCommVarCtxName(env) === envVar)
  const isValid = availableVarNames.includes(envVar)

  return (
    <span
      className={twMerge(
        'inline-flex items-center justify-between px-2 py-1 bg-white rounded-lg shadow-sm text-sm',
        'border',
        isValid ? 'border-pink-200' : 'border-red-200',
      )}
      style={{ width: '15ch' }}
    >
      <span
        className={twMerge(
          'font-medium truncate flex-1 mr-1',
          isValid ? 'text-gray-700' : 'text-red-600',
        )}
      >
        {isValid && foundVar ? foundVar.name : envVar}
      </span>
      <span
        className={twMerge(
          'text-xs px-1 py-0.5 rounded-full font-medium text-center shrink-0',
          isValid && foundVar
            ? typeColors[foundVar.type]
            : 'bg-red-100 text-red-700',
        )}
      >
        {isValid && foundVar ? typeLabels[foundVar.type] : '❌'}
      </span>
    </span>
  )
}

class LexReactEnvVarNode extends LexReactNode<EnvVarNodeProps> {
  decorate(): JSX.Element {
    return <EnvVarNode {...this.props} />
  }

  textContent(): string {
    return `{{#${this.props.envVar}#}}`
  }
}

export class LexEnvVarNode extends ReactDecoratorNode<
  EnvVarNodeProps,
  LexReactEnvVarNode
> {
  static getType(): string {
    return 'env-var'
  }

  static clone(_data: LexEnvVarNode): LexicalNode {
    return new LexEnvVarNode(_data.__reactProps, _data.__key)
  }

  static importJSON(
    serializedNode: SerializedLexicalReactNode<EnvVarNodeProps>,
  ): LexicalNode {
    return new LexEnvVarNode(serializedNode.reactProps)
  }

  constructor(props: EnvVarNodeProps, key?: NodeKey) {
    super(new LexReactEnvVarNode(props), key)
  }

  exportJSON(): SerializedLexicalReactNode<EnvVarNodeProps> {
    return {
      ...super.exportJSON(),
      type: this.constructor.getType(),
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
export const EnvVarRegex
  = /\{\{(#[a-zA-Z0-9_@-]{1,50}(\.[a-zA-Z_][\w]{0,29}){1,10}#)\}\}/gi

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
  const varCtxName = raw.slice(3, -3).split('.').slice(1).join('.')
  return $createEnvVarNode(varCtxName, envs)
}

export const $isEnvVarNode = (node: LexicalNode) => {
  return node instanceof LexEnvVarNode
}
