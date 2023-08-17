# kdim

A collection of interesting data structures and utility types for messing around with mathematical things in Node/JS/TS. No guarantees are made here as to the speed, efficiency, or correctness of tools providied!

[![NPM](https://img.shields.io/npm/v/kdim.svg?style=flat-square)](https://www.npmjs.com/package/kdim)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/kdim?style=flat-square)

[![GitHub stars](https://img.shields.io/github/stars/rektdeckard/kdim?style=flat-square&label=Star)](https://github.com/rektdeckard/kdim)
[![GitHub forks](https://img.shields.io/github/forks/rektdeckard/kdim?style=flat-square&label=Fork)](https://github.com/rektdeckard/kdim/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/rektdeckard/kdim?style=flat-square&label=Watch)](https://github.com/rektdeckard/kdim)
[![Follow on GitHub](https://img.shields.io/github/followers/rektdeckard?style=flat-square&label=Follow)](https://github.com/rektdeckard)

## Contents

- [Installation](#installation)
- [Numerics](#numerics)
  - [ComplexNumber](#complexnumber)
  - [Wrapping](#wrapping)
  - [Saturating](#saturating)
- [Types](#utility-types)
  - [Tuple](#tuple)
  - [Vec](#vec)
- [Data Structures](#data-structures)
  - [Matrix](#matrix)
  - [Binary Search Tree](#bst)
  - [K-dimensional Tree](#kdtree)
  - [Bloom Filter](#bloomfilter)
  - [Ring Buffer](#ringbuffer)
- [Transforms](#transforms)
  - [clamp](#clamp)
  - [lerp](#lerp)
- [Utilities](#utilities)
  - [Range](#range)
  - [Comparator](#comparator)
  - [objectHash](#objecthash)
- [Assertions](#assertions)
  - [castInteger](#castinteger)
  - [assertValidRange](#assertvalidrange)

## Installation

```bash
npm install --save kdim
```

## Numerics

### ComplexNumber

A numeric type with real and imaginary components. An instance of the class is immutable, so arithmetic operations on it will always produce a new instance.

<details>
  <summary>Class Signature</summary>
  <p>

```ts
class ComplexNumber implements Number {
  constructor(real?: number, imaginary?: number);

  get real(): number;
  get imaginary(): number;

  static from<N extends ComplexNumber | Number>(init: N): ComplexNumber;

  add(addend: Number | ComplexNumber): ComplexNumber;
  sub(subtrahend: Number | ComplexNumber): ComplexNumber;
  mul(multiplicand: Number | ComplexNumber): ComplexNumber;
  div(divisor: Number | ComplexNumber): ComplexNumber;
  pow(exponent: Number): ComplexNumber;
  eq(other: Number | ComplexNumber): boolean;
  conjugate(): ComplexNumber;

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
  toLocaleString(
    locales?: string | string[] | undefined,
    options?: Intl.NumberFormatOptions | undefined
  ): string;

  [Symbol.toPrimitive](hint: string): string | number;
  get [Symbol.toStringTag](): string;
}
```

  </p>
</details>

```ts
import { ComplexNumber } from "kdim";

const a = new ComplexNumber(-3, 5); // -3 + 5i
a.real; // -3
a.imaginary; // 5

const b = new ComplexNumber(7, -1); // 7 - i
a.add(b); // 4 + 4i
a.mul(b); // -16 + 38i
b.pow(2); // 48 - 14i

const c = ComplexNumber.from(b); // 7 - i
b.eq(c); // true
```

### Wrapping

A wrapping integer class, allowing a value to be constrained to an arbitrary range, and wrapping around the range when arithmetic operations cause it to overflow or underflow.

<details>
  <summary>Class Signature</summary>
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

class Wrapping implements Bounded, Number {
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
```

  </p>
</details>

```ts
import { Wrapping } from "kdim";

const u16 = new Wrapping({ max: 0xffff }, 1); // default min = 0
u16.add(0xfffd); // (0xFFFE)
u16.add(1); // (0xFFFF)
u16.add(1); // (0x0000)
u16.add(1); // (0x0001)
```

Wrapping integers can have arbitrary `min` and `max` values (inclusive), and can be initialized with a starting value. Arithmetic operations can be performed with any numeric type, using the bounds of the reciever, and can be chained:

```ts
import { Wrapping } from "kdim";

const wk = new Wrapping({ min: 1, max: 7 }); // default value = min
const yr = new Wrapping({ min: 1, max: 365 }, 24);

wk.add(yr); // (4)

yr.add(wk) // (28)
  .sub(3) // (25)
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

<details>
  <summary>Class Signature</summary>
  <p>

```ts
class Saturating implements Bounded, Number {
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
s; // Still (40)
s.add(20); // 50
```

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

A convenience type equivalent to `Tuple<number, K extends number>`, useful for mathematical computation and data structures.

```ts
import { Vec } from "kdim";

const position: Vec<3> = [1.0, 69, 420];
const speed: Vec<3> = [-1, 3, 11];
const accel: Vec<3> = [0, 0, "no"]; // Error: type 'string' is not assignable to type 'number'
```

## Data Structures

### Matrix

A concrete Matrix class for simple linear algebra, currently only supporting simple numbers, but with plans to add support for complex numbers.

<details>
  <summary>Class Signature</summary>
  <p>

```ts
class Matrix<M extends number, N extends number>
  implements Iterable<Tuple<number, N>>
{
  constructor(data: MatrixLike<M, N>);

  static zero<N extends number>(n: N): Matrix<N, N>;
  static identity<N extends number>(n: N): Matrix<N, N>;
  static withSize<M extends number, N extends number>(
    rows: M,
    cols: N,
    fillValue?: number
  ): Matrix<M, N>;
  static fromDiagonal<N extends number>(
    diagonal: Tuple<number, N> | number[]
  ): Matrix<N, N>;
  static fromMTX<M extends number, N extends number>(
    data: string,
    options?: MTXOptions
  ): Matrix<M, N>;
  static isMatrixLike<M extends number, N extends number>(
    arg: unknown,
    ...dimensions: [m: M, n: N] | []
  ): arg is MatrixLike<M, N>;

  get rows(): M;
  get cols(): N;
  get size(): number;
  get data(): MatrixLike<M, N>;

  isSquare(): boolean;

  at(i: number, j: number): number | undefined;
  row(i: number): Tuple<number, N> | undefined;
  col(j: number): Tuple<number, M> | undefined;
  clone(): Matrix<M, N>;
  submatrix<M extends number, N extends number>(
    removeRows: number[],
    removeCols: number[]
  ): Matrix<number, number>;

  trace(): number;
  determinant(): number | undefined;
  inverse(tolerance?: number): Matrix<M, M> | undefined;
  transpose(): Matrix<N, M>;

  add(other: MatrixOperand<M, N>): Matrix<M, N>;
  sub(other: MatrixOperand<M, N>): Matrix<M, N>;
  mul<I extends MatrixOperand<number, number> | number>(
    other: I
  ): MatrixResult<M, N, I>;
  pow(k: number): Matrix<M, M>;
  eq(other: MatrixOperand<M, N>, tolerance?: number): boolean;

  [Symbol.iterator](): Iterator<Vec<N>>;
}
```

  </p>
</details>

```ts
import { Matrix } from "kdim";

const mtx = new Matrix<3, 3>([
  [5, 2, 10],
  [-1, 7, 7],
  [3, -3, 9],
]);

mtx.rows; // 3
mtx.cols; // 3
mtx.col(2); // [10, 7, 9]
mtx.mul(2);
// [
//   [10, 4, 20],
//   [-2, 14, 14],
//   [6, -6, 18],
// ]

mtx.mul(Matrix.identity(3)).eq(mtx); // true
```

### BST

A simple binary search tree for time-efficient search or arbitrary data.

<details>
  <summary>Class Signature</summary>
  <p>

```ts
class BSTNode<V> {
  constructor(data: V, parent?: BSTNode<V>);
  asBST(): BST<V>;
}

class BST<V> implements Iterable<V> {
  constructor(compareFn?: CompareFunction<V>);

  static fromNode<V>(node: BSTNode<V>): BST<V>;

  search(value: V): BSTNode<V> | null;
  insert(value: V): boolean;
  has(value: V): boolean;
  delete(valueOrNode: V | BSTNode<V>): boolean;
  max(node?: BSTNode<V>): BSTNode<V> | null;
  min(node?: BSTNode<V>): BSTNode<V> | null;
  successor(node: BSTNode<V>): BSTNode<V> | null;
  predecessor(node: BSTNode<V>): BSTNode<V> | null;

  asOrdered(): V[];
  asPreOrdered(): V[];
  asPostOrdered(): V[];

  *[Symbol.iterator](): IterableIterator<V>;
}
```

  </p>
</details>

```ts
import { BST, CompareFunction } from "kdim";

type Person = { name: string; age: number };

const comp: CompareFunction<Person> = (a, b) =>
  a.name === b.name ? a.age - b.age : a > b ? 1 : -1;

const tree = new BST<Person>(comp);
tree.insert({ name: "Cillian Murphy", age: 47 });
tree.insert({ name: "Emily Blunt", age: 40 });
```

### KDTree

A time-efficient data structure for searching higher-dimensional datasets. Inspired by Mike Pound's [Computerphile Video](https://www.youtube.com/watch?v=BK5x7IUTIyU).

<details>
  <summary>Class Signature</summary>
  <p>

```ts
class Node<T> {
  constructor(point: T);
}

type KDTreeOptions = {
  clone?: boolean;
};

class KDTree<K extends number> implements Iterable<Vec<K>> {
  constructor(data?: Vec<K>[], options?: KDTreeOptions);

  get dimensions(): number;
  get tree() {
    return this.#tree;
  }

  #median(list: Vec<K>[]): [Vec<K>, number] {
    const center = Math.floor(list.length / 2);
    return [list[center], center];
  }

  #partition(
    list: Vec<K>[],
    dimension: number,
    parent: Node<Vec<K>> | null
  ): Node<Vec<K>> | null {
    if (list.length === 0) return null;

    list.sort((a, b) => a[dimension] - b[dimension]);
    const [point, index] = this.#median(list);
    const nextDimension = (dimension + 1) % this.#dimensions;

    const node = new Node<Vec<K>>(point);
    node.parent = parent;
    node.left = this.#partition(list.slice(0, index), nextDimension, node);
    node.right = this.#partition(list.slice(index + 1), nextDimension, node);

    return node;
  }

  [Symbol.iterator]() {
    return this.#data[Symbol.iterator]();
  }

  insert(point: Vec<K>) {
    if (!this.#data.length) {
      this.#dimensions = point.length;
    } else if (this.#dimensions !== point.length) {
      throw new TypeError(
        `Point [${point}] has ${point.length} dimensions, but should have ${
          this.#dimensions
        }`
      );
    }

    this.#data.push(point);
    this.#tree = this.#partition(this.#data, 0, null);
  }

  remove(point: Vec<K>): Vec<K> | null | void {
    if (!this.#data.length) return;
    if (point.length !== this.#dimensions) return;

    const result = this.nearestNeighbor(point);
    if (result.distance === 0) {
      const i = this.#data.findIndex((p) => p === result.point);
      this.#data.splice(i, 1);
      this.#tree = this.#partition(this.#data, 0, null);
      return result.point;
    }
  }

  has(point: Vec<K>): boolean {
    if (point.length !== this.#dimensions) return false;
    return this.nearestNeighbor(point).distance === 0;
  }

  nearestNeighbor(point: Vec<K>): {
    point: Vec<K> | null;
    distance: number;
  } {
    function sqdist(a: Vec<K>, b: Vec<K> | null | undefined): number {
      if (!b) return Infinity;

      return a.reduce((sum, curr, i) => {
        return sum + (curr - b[i]) ** 2;
      }, 0);
    }

    function closest(a: Node<Vec<K>> | null, b: Node<Vec<K>> | null) {
      if (!a) return b;
      if (!b) return a;
      if (sqdist(point, a.point) <= sqdist(point, b.point)) {
        return a;
      }

      return b;
    }

    const nearestNeighborImpl = (
      node: Node<Vec<K>> | null,
      depth: number
    ): Node<Vec<K>> | null => {
      if (!node) return null;

      let nextBranch;
      let otherBranch;
      if (
        point[depth % this.#dimensions] <= node.point[depth % this.dimensions]
      ) {
        nextBranch = node.left;
        otherBranch = node.right;
      } else {
        nextBranch = node.right;
        otherBranch = node.left;
      }

      let temp = nearestNeighborImpl(nextBranch, depth + 1);
      let best = closest(temp, node);

      const dsq = sqdist(point, best?.point);
      const dd =
        point[depth % this.#dimensions] - node.point[depth % this.#dimensions];

      if (dsq >= dd ** 2) {
        temp = nearestNeighborImpl(otherBranch, depth + 1);
        best = closest(temp, best);
      }

      return best;
    };

    const nearest = nearestNeighborImpl(this.#tree, 0);

    return {
      point: nearest?.point ?? null,
      distance: Math.sqrt(sqdist(point, nearest?.point)),
    };
  }
}
```

  </p>
</details>

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

### BloomFilter

A probabalistic data structure used to test for membership of a large set in which storage of all set elements is unfeasible. False positives are possible, but false negatives are not, so that the structure will tell you if an element is either "probably in the set" or "definitely not in the set".

<details>
  <summary>Class Signature</summary>
  <p>

```ts
type HashFunction<T> = (data: T) => Promise<string> | string;

type BloomFilterOptions<T> = {
  size?: number;
  hashFunctions?: Array<HashFunction<T>>;
};

class BloomFilter<T = any> {
  constructor(options?: BloomFilterOptions<T>);
  static DEFAULT_HASH_FUNCTIONS: HashFunction<any>[]:
  async add(element: T): void;
  async test(element: T): boolean;
}
```

  </p>
</details>

```ts
import { BloomFilter } from "kdim";

const filter = new BloomFilter<{ name: string }>();
await filter.add({ name: "Julien Baker" });
await filter.add({ name: "Phoebe Bridgers" });
await filter.add({ name: "Lucy Dacus" });

await filter.test({ name: "Phoebe Bridgers" }); // true
await filter.test({ name: "Julia Jacklin" }); // false
```

> Note: by default, `BloomFilter` uses a set of object hashers that considers two objects to have the same hash if all their properties are equal, therefore will consider structurally identical objects equal.

### RingBuffer

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

## Transforms

### clamp

Constrain a value to within a given range `[min, max]`.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function clamp(min: number, max: number, value: number): number;
```

  </p>
</details>

```ts
import { clamp } from "kdim";

// Clamp values to [0, 255]
const a = 32;
const b = 300;

clamp(0, 255, a); // 32
clamp(0, 255, b); // 255
```

> Note: throws a RangeError when the range is invalid, E.G. `min > max`.

### lerp

Linear interpolation of a value in the range `[0, 1]` to a value in the range `[from, to]`.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function lerp(from: number, to: number, value: number): number;
```

  </p>
</details>

```ts
import { lerp } from "kdim";

// Interpolate 0.4 in range [0,1] to range [1,99]
const value = 0.4;
const interpolated = lerp(1, 99, value); // 40.2
```

> Note: throws a RangeError when the value is outside of `[0, 1]`

## Utilities

### Range

Produce values over numeric ranges, including infinite ranges, descending ranges, and custom step sizes. The `Range.of` static method will produce an array, while the `Range.lazy` static method returns a Generator which can be iterated, producing values on demand.

<details>
  <summary>Class Signature</summary>
  <p>

```ts
type RangeOptions = { from?: number; to: number; step?: number };

type Constructor<T, A extends Array<unknown>> = {
  new (...args: A): T;
};

type Factory<T, A extends Array<unknown>> = (...args: A) => T;

class Range {
  static of<N = number>(
    where: number | RangeOptions,
    factory?: Constructor<N, [n: number]> | Factory<N, [n: number]>
  ): N[];

  static *lazy<N = number>(
    where: number | RangeOptions,
    factory?: Constructor<N, [n: number]> | Factory<N, [n: number]>
  ): Generator<N, void, void>;
}
```

  </p>
</details>

#### Simple numeric ranges

```ts
import { Range } from "kdim";

// Produce simple numeric ranges
const zeroToFive = Range.of(5); // [0, 1, 2, 3, 4, 5]

// Produce ranges with custom bounds and step sizes
const oddNumbers = Range.of({ from: 1, to: 9, step: 2 }); // [1, 3, 5, 7, 9]
const descending = Range.of({ from: 43, to: 40 }); // [43, 42, 41, 40]
```

By default, `from = 0` and `step = 1`, unless specified.

> Note: throws an Error when given a negative `step` size; the sign of the step is determined by the direction of the range, E.G. `Math.sign(to - from)`.

#### Ranges of custom values via factory function

```ts
// Produce a range of custom values with a factory function
type Foo = { bar: number };
const foos = Range.of<Foo>(3, (n) => ({
  bar: n ** n,
}));
// [{ bar: 0 }, { bar: 1 }, { bar: 4 }, { bar: 27 }]
```

#### Ranges of class instances

```ts
// Produce instances of a class with a constructor of type
// { new (n: number): T }
class Baz {
  n: number;
  s: number;
  constructor(n: number) {
    this.n = n;
    this.s = n * n;
  }
}

const bazzes = Range.of({ from: 2, to: 4 }, Baz);
// [Baz { n: 2, s: 4 }, Baz { n: 3, s: 9 }, Baz { n: 4, s: 16 }]
```

#### Lazy ranges

```ts
// Iterating an infinite range
const gen = Range.lazy({ from: 1, to: Infinity });
for (const i of gen) {
  if (i >= 99) break;
}
gen.next(); // 100

// Using a lazy range to defer producing values until needed
const deferred = Range.lazy({ to: 20 }, (n) => new ComplexNumber(-n, n - 5));
// Some time later...
const complexes = Array.from(deferred); // Only now are values produced
```

> Note: Generators over infinite ranges _will_ lock up resources and crash the process if you attempt to convert them to an Array via `Array.from(gen)`, `[...gen]`, or other means.

### Comparator

A class used to determine ordering and equality of values of arbitrary types. A `Comparator` implements custom equality (`eq`) and ordering (`gt`, `gte`, `lt`, `lte`) for values based on the provided `CompareFunction`. If no function is provided, it defaults to the same lexical comparison used by `Array.prototype.sort`.

<details>
  <summary>Class Signature</summary>
  <p>

```ts
type CompareFunction<V> = (a: V, b: V) => number;

class Comparator<V> {
  constructor(compareFn?: CompareFunction<V>);

  static lexicalCompare<V>(a: V, b: V): 0 | 1 | -1;
  static reverseLexicalCompare<V>(a: V, b: V): 0 | 1 | -1;
  static numericCompare<V extends Number = number>(a: V, b: V): number;
  static reverseNumericCompare<V extends Number = number>(a: V, b: V): number;

  eq(a: V, b: V): boolean;
  gt(a: V, b: V): boolean;
  gte(a: V, b: V): boolean;
  lt(a: V, b: V): boolean;
  lte(a: V, b: V): boolean;
}
```

  </p>
</details>

#### CompareFunction

The `CompareFunction` type is similar to the callback passed to `Array.prototype.sort`, in that it is called with two arguments `a` and `b`, and returns a number determining if `a` should be sorted before `b` (negative number), after `b` (positive number), or equal to `b` (0). The `Comparator` class has a number of built-in static `CompareFunction`s for ordering primitives.

```ts
import { Comparator } from "kdim";

// Using built-in CompareFunctions for sorting
const ns = [12, 5, 80, 3, -1];
const descendingOrder = ns.sort(Comparator.reverseNumericCompare);
// [80, 12, 5, 3, -1]

const words = ["hi", "there", "friends"];
const descendingWordOrder = words.sort(Comparator.reverseLexicalCompare);
// ["there", "friends", "hi"]
```

#### Comparator of a complex type

```ts
// Compare non-primitive values by comparing their primitive properties
const quzComp = new Comparator<{ quz: number }>((a, b) => {
  return Comparator.numericCompare(a.quz, b.quz);
});

quzComp.eq({ quz: 7 }, { quz: 7 }); // true
quzComp.lt({ quz: 7 }, { quz: 3 }); // true
quzComp.gte({ quz: 1 }, { quz: -20 }); // false
```

#### Comparator for values of multiple types

```ts
type A = { id: number; tag: string };
type B = { id: number; foo: string };

// As and Bs are considered equal if their ids and string part match,
// otherwise they are ordered first by id then by string part.
const abComp = new Comparator<A | B>((first, second) => {
  if (first.id === second.id) {
    const firstStr = (first as A).tag || (first as B).foo;
    const secondStr = (second as A).tag || (second as B).foo;
    return Comparator.lexicalCompare(firstStr, secondStr);
  } else {
    return first.id - second.id;
  }
});

abComp.eq({ id: 1, tag: "cool" }, { id: 1, foo: "bad" }); // false
abComp.eq({ id: 1, tag: "cool" }, { id: 1, foo: "cool" }); // true
abComp.gt({ id: 1, tag: "cool" }, { id: 1, tag: "neat" }); // true
abComp.lte({ id: 5, tag: "ok" }, { id: 99, tag: "neat" }); // false
```

### objectHash

A hashing function for arbitrary objects and primitives that digests the value into a pseudo-unique base-16 hash string. Uses structural hashing, such that objects of identical structure will produce the same hash.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
type ObjectHashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

type ObjectHashOptions = {
  algorithm?: ObjectHashAlgorithm;
};

async function objectHash<T>(
  obj: T,
  options?: ObjectHashOptions
): Promise<string>;
```

  </p>
</details>

```ts
import { objectHash } from "kdim";

const hash = await objectHash({ foo: 7, bar: [] }, { algorithm: "SHA-1" });
// "1448bf86764e7ff7f9df0cb61b2d77c946ba854"
```

## Assertions

### castInteger

Assert that a number (or object convertible to number) has no fractional part and is within the safe integer range, and cast it to a primitive number.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function castInteger<N extends Number>(n: N): number;
```

  </p>
</details>

```ts
import { castInteger, Wrapping } from "kdim";

const i = 300;
const u8 = new Wrapping({ max: 7 }, 5);
const f = 29.7;

const safeI = castInteger(i); // 300
const safeU8 = castInteger(u8); // 5
const errF = castInteger(f); // Error: Values must be safe integers
```

> Note: throws a RangeError if `n` has a fractional part, is not in safe integer range, or cannot be coerced from/to a number via `Number(n)` and `n.valueOf()`.

### assertValidRange

Assert that the arguments constitute a valid range, in which `min < max`, and, if present, `min <= value && value <= max`.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function assertValidRange(min: number, max: number, value?: number): void;
```

  </p>
</details>

```ts
assertValidRange(0, 5);
assertValidRange(0, 5, 1);
assertValidRange(5, 0); // Error: Minimum must be less than maximum
assertValidRange(0, 5, 9); // Error: Value must be between minimum and maximum
```

## License

MIT © [Tobias Fried](https://github.com/rektdeckard)
