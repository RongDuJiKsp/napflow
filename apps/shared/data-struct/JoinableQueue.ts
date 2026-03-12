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

  enqueueNext(element: T): JoinableQueue<T> {
    this.pushFront(element)
    return this
  }

  enqueueNextMany(elements: T[]): JoinableQueue<T> {
    for (let i = elements.length - 1; i >= 0; i--) this.enqueueNext(elements[i])
    return this
  }

  static fromArray<E>(elements: E[]): JoinableQueue<E> {
    return new JoinableQueue<E>(elements)
  }
}

export default JoinableQueue
