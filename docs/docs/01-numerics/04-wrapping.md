# Wrapping

A wrapping integer class, allowing a value to be constrained to an arbitrary range, and wrapping around the range when arithmetic operations cause it to overflow or underflow Wrapping numbers are immutable, so arithmetic methods always produce new values.

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

  add<N extends Number>(n: N): Wrapping;
  sub<N extends Number>(n: N): Wrapping;

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

let u16 = new Wrapping({ max: 0xffff }, 1); // default min = 0
u16 = u16.add(0xfffd); // (0xFFFE)
u16 = u16.add(1); // (0xFFFF)
u16 = u16.add(1); // (0x0000)
u16 = u16.add(1); // (0x0001)
```

Wrapping integers can have arbitrary `min` and `max` values (inclusive), and can be initialized with a starting value. Arithmetic operations can be performed with any numeric type, using the bounds of the reciever, and can be chained:

```ts
import { Wrapping } from "kdim";

let wk = new Wrapping({ min: 1, max: 7 }); // default value = min
let yr = new Wrapping({ min: 1, max: 365 }, 24);

wk = wk.add(yr); // (4)
yr = yr
  .add(wk) // (28)
  .sub(3) // (25)
  .sub(30); // (361)
```

:::danger THROWS

Constructor throws a `RangeError` when `min >= max` or any of `min`, `max`, or `initial` have a fracitonal component, as will attempting to `add()` or `sub()` a number with a fractional component.

:::

They can also be cloned from other Wrapping values, or other `Bounded` values like [Saturating](saturating), copying their properties:

```ts
import { Wrapping, Saturating } from "kdim";

const vuMeter = new Saturating({ min: -20, max: 3 }, -3);
const clip = Wrapping.from(vuMeter);
```
