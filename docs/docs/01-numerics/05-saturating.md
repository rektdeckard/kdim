# Saturating

A saturating (or clamping) integer class allowing a value to be constrained to an arbitrary range, and clamping it to the bounds when arithmetic operations would cause it to overflow or underflow. Saturating numbers are immutable, so arithmetic methods always produce new values.

<details>
  <summary>Class Signature</summary>
  <p>

```ts
class Saturating implements Bounded, Number {
  constructor({ max, min }: BoundedOptions, value?: number);

  static from(bounded: Bounded): Saturating;

  add<N extends Number>(n: N): Saturating;
  sub<N extends Number>(n: N): Saturating;
  mul<N extends Number>(n: N): Saturating;
  div<N extends Number>(n: N): Saturating;

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

let level = new Saturating({ min: 1, max: 99 });
level = level.add(50); // (51)
level = level.add(30); // (81)
level = level.add(30); // (99)
```

As with [Wrapping](wrapping), Saturating types support arithmetic operations with any numeric type, using the receiver.

```ts
import { Saturating, Wrapping } from "kdim";

const s = new Saturating({ min: -1, max: 10 }, 1);
const w = new Wrapping({ max: 7 });
s.add(7); // (8)
w.add(5); // (5)
s.add(w); // (8)
```

:::danger THROWS

Constructor throws a `RangeError` when `min >= max` or any of `min`, `max`, or `initial` have a fracitonal component, as will attempting to `add()`, `sub()`, `mul()`, or `div()` a number with a fractional component or attempting to `div(0)`.

:::

[Wrapping](wrapping) and [Saturating](saturating) values may also be used with mathematical operators for convenience, though they will be cast to a primitive in doing so, and will not be modified:

```ts
import { Saturating } from "kdim";

const s = new Saturating({ max: 50 }, 40);
const primitiveSum = s + 20; // 60
s; // Still (40)
s.add(20); // 50
```
