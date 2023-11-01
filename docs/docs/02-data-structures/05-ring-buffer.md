# RingBuffer

A fixed-capacity FIFO queue that overwrites earliest entries when its capacity is exceeded.

<details>
  <summary>Class Signature</summary>
  <p>

```ts
type Constructor<T> = { new (capacity: number): RingBuffer<T> };
class RingBuffer<T> implements Iterable<T | null> {
  constructor(capacity: number);

  static from<T>(this: Constructor<RingBuffer<T>>, data: T[]): RingBuffer<T>;

  get capacity(): number;
  get data(): (T | null)[];
  get isEmpty(): boolean;
  get isFull(): boolean;

  get [Symbol.toStringTag](): string;
  toString(): string;

  [Symbol.iterator](): IterableIterator<T | null>;

  peek(index: number = 0): T | null;
  enqueue(element: T): void;
  dequeue(): T | null;
  drain(): T[];
}
```

  </p>
</details>

```ts
import { RingBuffer } from "kdim";

// Initialized with capacity
const buff = new RingBuffer<string>(10);

buff.enqueue("age");
buff.enqueue("quod");
buff.enqueue("agis");

buff.isFull; // false
buff.isEmpty; // false

buff.dequeue(); // "age"
buff.peek(); // "quod"
buff.drain(); // ["quod", "agis"]

buff.isEmpty; // true

// Initialized with data
const buff2 = RingBuffer.from([12, 24, 36, 48]);

buff.capacity; // 4

buff.enqueue(1);
buff.peek(); // 1
buff.peek(2); // 36
buff.dequeue(); // 1
buff.dequeue(); // 24
buff.drain(); // [36, 48];
```
