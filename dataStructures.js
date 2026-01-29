class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  peek() {
    return this.items.length ? this.items[this.items.length - 1] : undefined;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  toArray() {
    return [...this.items];
  }

  trim(maxSize) {
    if (typeof maxSize !== "number" || maxSize <= 0) {
      return;
    }
    if (this.items.length > maxSize) {
      this.items = this.items.slice(this.items.length - maxSize);
    }
  }
}

class Queue {
  constructor() {
    this.items = [];
    this.offset = 0;
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    if (this.isEmpty()) {
      return undefined;
    }
    const item = this.items[this.offset];
    this.offset += 1;
    if (this.offset * 2 >= this.items.length) {
      this.items = this.items.slice(this.offset);
      this.offset = 0;
    }
    return item;
  }

  front() {
    return this.isEmpty() ? undefined : this.items[this.offset];
  }

  isEmpty() {
    return this.size() === 0;
  }

  size() {
    return this.items.length - this.offset;
  }

  toArray() {
    return this.items.slice(this.offset);
  }
}

class PriorityQueue {
  constructor(compareFn) {
    this.compare =
      compareFn || ((a, b) => (a === b ? 0 : a < b ? -1 : 1));
    this.heap = [];
  }

  enqueue(item) {
    this.heap.push(item);
    this.#bubbleUp(this.heap.length - 1);
  }

  dequeue() {
    if (!this.heap.length) {
      return undefined;
    }
    const top = this.heap[0];
    const tail = this.heap.pop();
    if (this.heap.length) {
      this.heap[0] = tail;
      this.#bubbleDown(0);
    }
    return top;
  }

  peek() {
    return this.heap.length ? this.heap[0] : undefined;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  toArray() {
    return [...this.heap].sort(this.compare);
  }

  #bubbleUp(index) {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      if (this.compare(this.heap[currentIndex], this.heap[parentIndex]) >= 0) {
        break;
      }
      this.#swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
    }
  }

  #bubbleDown(index) {
    let currentIndex = index;
    const length = this.heap.length;
    while (true) {
      const leftIndex = currentIndex * 2 + 1;
      const rightIndex = currentIndex * 2 + 2;
      let smallest = currentIndex;

      if (
        leftIndex < length &&
        this.compare(this.heap[leftIndex], this.heap[smallest]) < 0
      ) {
        smallest = leftIndex;
      }

      if (
        rightIndex < length &&
        this.compare(this.heap[rightIndex], this.heap[smallest]) < 0
      ) {
        smallest = rightIndex;
      }

      if (smallest === currentIndex) {
        break;
      }

      this.#swap(currentIndex, smallest);
      currentIndex = smallest;
    }
  }

  #swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor(maxSize = Infinity) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    this.maxSize = maxSize;
  }

  addToHead(value) {
    const node = new LinkedListNode(value);
    node.next = this.head;
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
    this.length += 1;
    if (this.length > this.maxSize) {
      this.removeTail();
    }
    return node;
  }

  remove(predicate) {
    if (!this.head) {
      return false;
    }
    if (predicate(this.head.value)) {
      this.head = this.head.next;
      if (!this.head) {
        this.tail = null;
      }
      this.length -= 1;
      return true;
    }
    let current = this.head;
    while (current.next) {
      if (predicate(current.next.value)) {
        if (current.next === this.tail) {
          this.tail = current;
        }
        current.next = current.next.next;
        this.length -= 1;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  removeTail() {
    if (!this.tail) {
      return;
    }
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
      this.length = 0;
      return;
    }
    let current = this.head;
    while (current.next && current.next !== this.tail) {
      current = current.next;
    }
    current.next = null;
    this.tail = current;
    this.length -= 1;
  }

  toArray() {
    const output = [];
    let current = this.head;
    while (current) {
      output.push(current.value);
      current = current.next;
    }
    return output;
  }

  size() {
    return this.length;
  }
}

module.exports = {
  Stack,
  Queue,
  PriorityQueue,
  LinkedList,
};
