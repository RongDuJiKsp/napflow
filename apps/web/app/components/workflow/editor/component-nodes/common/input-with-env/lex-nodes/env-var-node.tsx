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
import type { LexicalNode, NodeKey, TextNode } from 'lexical'
import { $splitTextNode } from '@/app/components/_base/lexical/utils/common'

type EnvVarNodeProps = {
  envVar: VarCtxName;
  envs: VarCtx[];
}

const typeColors: Record<VarTypes, string> = {
  [VarTypes.String]: 'text-blue-700',
  [VarTypes.Number]: 'text-green-700',
  [VarTypes.StringArray]: 'text-purple-700',
  [VarTypes.NumberArray]: 'text-pink-700',
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
        'inline-flex items-center justify-between px-1 mx-0.5 py-0.5 bg-white rounded-sm shadow-sm h-lh',
        'border',
        isValid ? 'border-pink-200' : 'border-red-200',
      )}
    >
      <span
        className={twMerge(
          'font-medium truncate flex-1 mr-1',
          isValid ? 'text-gray-700' : 'text-red-600',
        )}
      >
        {isValid && foundVar ? foundVar.name : envVar}
      </span>
      &ensp;
      <span
        className={twMerge(
          'font-medium  rounded-full text-center shrink-0',
          isValid && foundVar
            ? typeColors[foundVar.type]
            : ' text-red-700',
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

  isInline(): boolean {
    return true
  }

  createDOM(): HTMLElement {
    const div = super.createDOM()
    div.classList.add('inline-flex', 'items-center', 'align-middle')
    return div
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
  = /\{\{(#[a-zA-Z0-9_@\-]{1,50}(\.[a-zA-Z_][\w]{0,29}){1,10}#)\}\}/i

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

export const $transformEnvVarNode = (node: TextNode, envs: VarCtx[]) => {
  if(!EnvVarRegex.test(node.getTextContent()))
    return
  const splitedNodes = $splitTextNode(node, EnvVarRegex)
  for(const splitedNode of splitedNodes) {
    if(!EnvVarRegex.test(splitedNode.getTextContent()))
      continue
    splitedNode.replace($createEnvVarNodeFromRaw(splitedNode.getTextContent(), envs))
  }
}
export const $isEnvVarNode = (node: LexicalNode) => {
  return node instanceof LexEnvVarNode
}
