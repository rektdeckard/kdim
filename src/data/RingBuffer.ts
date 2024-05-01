type Constructor<T> = { new(capacity: number): RingBuffer<T> };

export class RingBuffer<T> implements Iterable<T | null> {
  private _data: (T | null)[];
  private _capacity: number;
  private _readIndex: number = 0;
  private _writeIndex: number = 0;

  constructor(capacity: number) {
    if (typeof capacity !== "number" || capacity <= 0) {
      throw new RangeError("Must be initialized with a capacity");
    }

    this._data = new Array(capacity).fill(null);
    this._capacity = capacity;
  }

  static from<T>(this: Constructor<RingBuffer<T>>, data: T[]): RingBuffer<T> {
    const buff = new RingBuffer<T>(data.length);
    buff._data = data;
    return buff;
  }

  get capacity() {
    return this._capacity;
  }

  get data() {
    return this._data;
  }

  get isEmpty(): boolean {
    // FIXME: this should be O(1)
    return this._data.every((el) => el === null);
  }

  get isFull(): boolean {
    // FIXME: this should be O(1)
    return this._data.every((el) => el !== null);
  }

  get [Symbol.toStringTag]() {
    return "RingBuffer";
  }

  toString(): string {
    return JSON.stringify({ data: this._data, capacity: this._capacity });
  }

  [Symbol.iterator]() {
    return this._data[Symbol.iterator]();
  }

  peek(index: number = 0): T | null {
    return this._data.at((this._readIndex + index) % this._capacity) ?? null;
  }

  enqueue(element: T) {
    this._data[this._writeIndex++] = element;
    this._writeIndex %= this._capacity;
  }

  dequeue(): T | null {
    const [element] = this._data.splice(this._readIndex++, 1, null);
    this._readIndex %= this._capacity;
    return element;
  }

  drain(): T[] {
    const data = this._data.filter((el) => el !== null) as T[];
    this._data = [];
    this._readIndex = 0;
    this._writeIndex = 0;
    return data;
  }
}
