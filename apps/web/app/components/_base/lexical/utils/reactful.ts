import type { NodeKey, SerializedLexicalNode } from 'lexical'
import { DecoratorNode } from 'lexical'
import type { JSX } from 'react'

export abstract class LexReactNode<Props = any> {
  readonly props: Props

  constructor(props: Props) {
    this.props = props
  }

  abstract decorate(): JSX.Element

  abstract textContent(): string

  createDOM(): HTMLElement {
    return document.createElement('div')
  }

  updateDOM(): boolean {
    return false
  }
}

export type SerializedLexicalReactNode<Props> = SerializedLexicalNode & {
  reactProps: Props;
}

export abstract class ReactDecoratorNode<
  NodeProps,
  ReactNode extends LexReactNode<NodeProps> = LexReactNode<NodeProps>,
> extends DecoratorNode<JSX.Element> {
  readonly __reactNode: ReactNode

  constructor(reactNode: ReactNode, nodeKey?: NodeKey) {
    super(nodeKey)
    this.__reactNode = reactNode
  }

  get __reactProps() {
    return this.__reactNode.props
  }

  createDOM(): HTMLElement {
    return this.__reactNode.createDOM()
  }

  updateDOM(): boolean {
    return this.__reactNode.updateDOM()
  }

  decorate(): JSX.Element {
    return this.__reactNode.decorate()
  }

  getTextContent(): string {
    return this.__reactNode.textContent()
  }

  exportJSON(): SerializedLexicalReactNode<ReactNode['props']> {
    return {
      type: this.constructor.getType(),
      version: 1,
      reactProps: this.__reactProps,
    }
  }
}
