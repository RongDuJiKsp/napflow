import { Deque } from 'datastructures-js'

// 把dequeue包装成queue
class JoinableQueue<T> extends Deque<T> {
  pushBack(element: T): JoinableQueue<T> {
    super.pushBack(element)
    return this
  }

  pushFront(element: T): JoinableQueue<T> {
    super.pushFront(element)
    return this
  }

  enqueue(element: T): JoinableQueue<T> {
    return this.pushBack(element)
  }

  dequeue(): T | null {
    return this.popFront()
  }

  clone(): JoinableQueue<T> {
    return new JoinableQueue<T>(this.toArray())
  }

  static fromArray<E>(elements: E[]): JoinableQueue<E> {
    return new JoinableQueue<E>(elements)
  }
}

export default JoinableQueue
