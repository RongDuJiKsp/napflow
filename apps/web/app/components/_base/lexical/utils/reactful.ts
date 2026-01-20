import type { NodeKey } from 'lexical'
import { DecoratorNode } from 'lexical'
import type { JSX } from 'react'

export abstract class LexReactNode<Props = any> {
  readonly props: Props

  constructor(props: Props) {
    this.props = props
  }

  abstract decorate(): JSX.Element

  createDOM(): HTMLElement {
    return document.createElement('div')
  }

  updateDOM(): boolean {
    return false
  }
}

export abstract class ReactDecoratorNode<ReactNode extends LexReactNode = LexReactNode> extends DecoratorNode<JSX.Element> {
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
}
