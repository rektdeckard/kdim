# kdim

A collection of interesting data structures and utility types for messing around with mathematical things in Node/JS/TS. No guarantees are made here as to the speed, efficiency, or correctness of tools providied!

[![NPM](https://img.shields.io/npm/v/kdim.svg?style=flat-square)](https://www.npmjs.com/package/kdim)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/kdim?style=flat-square)

[![GitHub stars](https://img.shields.io/github/stars/rektdeckard/kdim?style=flat-square&label=Star)](https://github.com/rektdeckard/kdim)
[![GitHub forks](https://img.shields.io/github/forks/rektdeckard/kdim?style=flat-square&label=Fork)](https://github.com/rektdeckard/kdim/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/rektdeckard/kdim?style=flat-square&label=Watch)](https://github.com/rektdeckard/kdim)
[![Follow on GitHub](https://img.shields.io/github/followers/rektdeckard?style=flat-square&label=Follow)](https://github.com/rektdeckard)

## Installation

```bash
yarn add kdim
```

or

```bash
npm install --save kdim
```

---

## Numerics

### Wrapping

A wrapping integer class, allowing a value to be constrained to an arbitrary range, and wrapping around the range when arithmetic operations cause it to overflow or underflow.

```ts
import { Wrapping } from "kdim";

const u16 = new Wrapping({ max: 0xffff }, 1); // default min = 0
u16.add(0xfffd); // (0xFFFE)
u16.add(1);      // (0xFFFF)
u16.add(1);      // (0x0000)
u16.add(1);      // (0x0001)
```

Wrapping integers can have arbitrary `min` and `max` values (inclusive), and can be initialized with a starting value. Arithmetic operations can be performed with any numeric type, using the bounds of the reciever, and can be chained:

```ts
import { Wrapping } from "kdim";

const wk = new Wrapping({ min: 1, max: 7 }); // default value = min
const yr = new Wrapping({ min: 1, max: 365 }, 24);

wk.add(yr); // (4)

yr.add(wk)  // (28)
  .sub(3)   // (25)
  .sub(30); // (361)
```

> **NOTE:** constructor throws a `RangeError` when `min >= max` or any of `min`, `max`, or `initial` have a fracitonal component, as will attempting to `add()` or `sub()` a number with a fractional component.

They can also be cloned from other Wrapping values, or other `Bounded` values like [Saturating](#saturating), copying their properties:

```ts
import { Wrapping, Saturating } from "kdim";

const vuMeter = new Saturating({ min: -20, max: 3 }, -3);
const clip = Wrapping.from(vuMeter);
```

### Saturating

A saturating (or clamping) integer class allowing a value to be constrained to an arbitrary range, and clamping it to the bounds when arithmetic operations would cause it to overflow or underflow.

```ts
import { Saturating } from "kdim";

const level = new Saturating({ min: 1, max: 99 });
level.add(50); // (51)
level.add(30); // (81)
level.add(30); // (99)
```

As with [Wrapping](#wrapping), Saturating types support arithmetic operations with any numeric type, using the receiver.

```ts
import { Saturating, Wrapping } from "kdim";

const s = new Saturating({ min: -1, max: 10 }, 1);
const w = new Wrapping({ max: 7 });
s.add(7); // (8)
w.add(5); // (5)
s.add(w); // (10)
```

> **NOTE:** constructor throws a `RangeError` when `min >= max` or any of `min`, `max`, or `initial` have a fracitonal component, as will attempting to `add()`, `sub()`, `mul()`, or `div()` a number with a fractional component or attempting to `div(0)`.

[Wrapping](#wrapping) and [Saturating](#saturating) values may also be used with mathematical operators for convenience, though they will be cast to a primitive in doing so, and will not be modified:

```ts
import { Saturating } from "kdim";

const s = new Saturating({ max: 50 }, 40);
const primitiveSum = s + 20; // 60
s                            // Still (40)
s.add(20);                   // 50
```

<details>
  <summary>Class Signatures</summary>
  <p>

```ts
abstract class Bounded {
  abstract get value(): number;
  abstract get min(): number;
  abstract get max(): number;
}

type BoundedOptions = {
  max: number;
  min?: number;
};

declare class Wrapping implements Bounded, Number {
  constructor({ max, min }: BoundedOptions, value?: number);

  static from(bounded: Bounded): Wrapping;

  add<N extends Number>(n: N): this;
  sub<N extends Number>(n: N): this;

  get value(): number;
  get min(): number;
  get max(): number;

  valueOf(): number;
  toFixed(fractionDigits?: number | undefined): string;
  toExponential(fractionDigits?: number | undefined): string;
  toPrecision(precision?: number | undefined): string;
  toString(radix?: number | undefined): string;
  toLocaleString(locales?: unknown, options?: unknown): string;
  toLocaleString(
    locales?: Intl.LocalesArgument,
    options?: Intl.NumberFormatOptions | undefined
  ): string;

  [Symbol.toPrimitive](hint: string): string | number;
  get [Symbol.toStringTag](): string;
}

declare class Saturating implements Number {
  constructor({ max, min }: BoundedOptions, value?: number);

  static from(bounded: Bounded): Saturating;

  add<N extends Number>(n: N): this;
  sub<N extends Number>(n: N): this;
  mul<N extends Number>(n: N): this;
  div<N extends Number>(n: N): this;

  get value(): number;
  get min(): number;
  get max(): number;

  valueOf(): number;
  toFixed(fractionDigits?: number | undefined): string;
  toExponential(fractionDigits?: number | undefined): string;
  toPrecision(precision?: number | undefined): string;
  toString(radix?: number | undefined): string;
  toLocaleString(locales?: unknown, options?: unknown): string;
  toLocaleString(
    locales?: Intl.LocalesArgument,
    options?: Intl.NumberFormatOptions | undefined
  ): string;

  [Symbol.toPrimitive](hint: string): string | number;
  get [Symbol.toStringTag](): string;
}
```

  </p>
</details>

## Utility Types

### Tuple

A typed tuple of generic length.

```ts
import { Tuple } from "kdim";

const threeBoolTuple: Tuple<boolean, 3> = [true, false, false];
const wrongBoolTuple: Tuple<boolean, 3> = [false, true]; // Error: Source has 2 element(s) but target requires 3
```

This also composes to allow for strongly-typed multidimensional arrays, such as a chess board:

```ts
import { Tuple } from "kdim";

type Piece = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
type Board = Tuple<Tuple<Piece | null, 8>, 8>;

const board: Board = [
  ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"],
  ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn"],
  ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"],
];
```

### Vec

A convenience type equivalent to `Tuple<number, K>`, useful for mathematical computation and data structures.

```ts
import { Vec } from "kdim";

const position: Vec<3> = [1.0, 69, 420];
const speed: Vec<3> = [-1, 3, 11];
const accel: Vec<3> = [0, 0, "no"]; // Error: type 'string' is not assignable to type 'number'
```

---

## Data Structures

### KDTree

A time-efficient data structure for searching higher-dimensional datasets. Inspired by Mike Pound's [Computerphile Video](https://www.youtube.com/watch?v=BK5x7IUTIyU).

```ts
import { Vec, KDTree } from "kdim";

const data: Vec<5>[] = [
  [0, 1, 1, 0, 1],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 1, 0],
];

const tree = new KDTree<5>(data);
const testPoint: Vec<5> = [1, 0, 1, 1, 1];

tree.has(testPoint); // false

const { point, distance } = tree.nearestNeighbor(testPoint);
// { point: [1, 1, 1, 1, 1], distance: 1 }

tree.insert(testPoint);
tree.has(testPoint); // true

tree.remove(testPoint);
tree.has(testPoint); // false
```

> Note: by default, input datasets are shallowly copied during tree construction, and retained within the data structure. If desired, the underlying dataset may be used without copying, using the option `copy: false`;

### RingBuffer

A fixed-capacity FIFO queue that overwrites earliest entries when its capacity is exceeded.

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

---

## License

MIT © [Tobias Fried](https://github.com/rektdeckard)
