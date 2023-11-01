# Complex

A numeric type with real and imaginary components. An instance of the class is immutable, so arithmetic operations on it will always produce a new instance.

<details>
  <summary>Class Signature</summary>
  <p>

```ts
class Complex implements Number {
  constructor(real?: number, imaginary?: number);

  get real(): number;
  get imaginary(): number;

  static from<N extends Complex | Number>(init: N): Complex;

  add(addend: Number | Complex): Complex;
  sub(subtrahend: Number | Complex): Complex;
  mul(multiplicand: Number | Complex): Complex;
  div(divisor: Number | Complex): Complex;
  pow(exponent: Number): Complex;
  eq(other: Number | Complex): boolean;
  conjugate(): Complex;

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

## Example

```ts
import { Complex } from "kdim";

const a = new Complex(-3, 5); // -3 + 5i
a.real; // -3
a.imaginary; // 5

const b = new Complex(7, -1); // 7 - i
a.add(b); // 4 + 4i
a.mul(b); // -16 + 38i
b.pow(2); // 48 - 14i

const c = Complex.from(b); // 7 - i
b.eq(c); // true
```
