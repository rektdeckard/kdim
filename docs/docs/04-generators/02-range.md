# Range

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

## Simple numeric ranges

```ts
import { Range } from "kdim";

// Produce simple numeric ranges
const zeroToFive = Range.of(5); // [0, 1, 2, 3, 4, 5]

// Produce ranges with custom bounds and step sizes
const oddNumbers = Range.of({ from: 1, to: 9, step: 2 }); // [1, 3, 5, 7, 9]
const descending = Range.of({ from: 43, to: 40 }); // [43, 42, 41, 40]
```

By default, `from = 0` and `step = 1`, unless specified.

:::danger THROWS

Throws an Error when given a negative `step` size; the sign of the step is determined by the direction of the range, E.G. `Math.sign(to - from)`.

:::

## Ranges of custom values via factory function

```ts
// Produce a range of custom values with a factory function
type Foo = { bar: number };
const foos = Range.of<Foo>(3, (n) => ({
  bar: n ** n,
}));
// [{ bar: 0 }, { bar: 1 }, { bar: 4 }, { bar: 27 }]
```

## Ranges of class instances

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

## Lazy ranges

```ts
// Iterating an infinite range
const gen = Range.lazy({ from: 1, to: Infinity });
for (const i of gen) {
  if (i >= 99) break;
}
gen.next(); // 100

// Using a lazy range to defer producing values until needed
const deferred = Range.lazy({ to: 20 }, (n) => new Complex(-n, n - 5));
// Some time later...
const complexes = Array.from(deferred); // Only now are values produced
```

:::danger DANGER

Generators over infinite ranges _will_ lock up resources and crash the process if you attempt to convert them to an Array via `Array.from(gen)`, `[...gen]`, or other means.

:::
