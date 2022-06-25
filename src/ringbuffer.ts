type Constructor<T> = { new (capacity: number): RingBuffer<T> };

export class RingBuffer<T> implements Iterable<T | null> {
  #data: (T | null)[];
  #capacity: number;
  #readIndex: number = 0;
  #writeIndex: number = 0;

  constructor(capacity: number) {
    if (typeof capacity !== "number" || capacity <= 0) {
      throw new RangeError("Must be initialized with a capacity");
    }

    this.#data = new Array(capacity).fill(null);
    this.#capacity = capacity;
  }

  static from<T>(this: Constructor<RingBuffer<T>>, data: T[]): RingBuffer<T> {
    const buff = new RingBuffer<T>(data.length);
    buff.#data = data;
    return buff;
  }

  get capacity() {
    return this.#capacity;
  }

  get data() {
    return this.#data;
  }

  get isEmpty(): boolean {
    // FIXME: this should be O(1)
    return this.#data.every((el) => el === null);
  }

  get isFull(): boolean {
    // FIXME: this should be O(1)
    return this.#data.every((el) => el !== null);
  }

  get [Symbol.toStringTag]() {
    return "RingBuffer";
  }

  toString(): string {
    return JSON.stringify({ data: this.#data, capacity: this.#capacity });
  }

  [Symbol.iterator]() {
    return this.#data[Symbol.iterator]();
  }

  peek(index: number = 0): T | null {
    return this.#data.at((this.#readIndex + index) % this.#capacity) ?? null;
  }

  enqueue(element: T) {
    this.#data[this.#writeIndex++] = element;
    this.#writeIndex %= this.#capacity;
  }

  dequeue(): T | null {
    const [element] = this.#data.splice(this.#readIndex++, 1, null);
    this.#readIndex %= this.#capacity;
    return element;
  }

  drain(): T[] {
    const data = this.#data.filter((el) => el !== null) as T[];
    this.#data = [];
    this.#readIndex = 0;
    this.#writeIndex = 0;
    return data;
  }
}
