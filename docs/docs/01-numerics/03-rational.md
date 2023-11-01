# Rational

A rational number class for fraction arithmetic without loss of precision. Operations are only guaranteed where numerator and denominator are within `Number.MIN_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`.

<details>
  <summary>Class Signature</summary>
  <p>

```ts
class Rational implements Number {
  constructor(numerator: number, denominator: number = 1);

  get numerator(): number;
  get denominator(): number;

  static from(...input: RationalLike | [fraction: string]): Rational;
  static parse(fraction: string): Rational;

  recip(): Rational;
  add(...addend: RationalLike): Rational;
  sub(...subtrahend: RationalLike): Rational;
  mul(...multiplicand: RationalLike): Rational;
  div(...divisor: RationalLike): Rational;
  pow(exponent: number): Rational;
  mod(modulus: number): Rational;
  abs(): Rational;
  eq(...other: RationalLike): boolean;
  gt(...other: RationalLike): boolean;
  gte(...other: RationalLike): boolean;
  lt(...other: RationalLike): boolean;
  lte(...other: RationalLike): boolean;

  toFraction(options?: RationalFormatOptions): string;

  valueOf(): number;
  toFixed(fractionDigits?: number | undefined): string;
  toExponential(fractionDigits?: number | undefined): string;
  toPrecision(precision?: number | undefined): string;
  toString(radix?: number | undefined): string;
}

type RationalFormat = "space" | "nospace" | "unicode";

type RationalFormatOptions = {
  mixed?: boolean;
  format?: RationalFormat;
};

type RationalLike =
  | [rational: Rational]
  | [numerator: number]
  | [numerator: number, denominator: number];
```

  </p>
</details>

```ts
import { Rational } from "kdim";

const a = new Rational(5, 31); // construct from numerator, denominator
const b = Rational.parse("3 / 9"); // parse from string (spaces are not required)

const result = a
  .add(b) // rationals as arguments
  .mul(12) // integer arguments
  .div(5, 4) // implicit rational arguments
  .toFraction(); // "116/155"

Rational.parse("16 / 24").eq("2 / 3"); // true
```

Rationals are immutable, so arithmetic methods always produce new values. They will always simplify to their most reduced form upon construction.

Serializing a Rational by calling the `toFraction` allows to specify whether it should be in `mixed` number or irrational format (the default), as well as whether the unicode `FRACTION SLASH` (`\u2044`) character should be used instead of a typical forward slash (`/`), which produces small fractions on some platforms, E.G. `3⁄4`.

```ts
import { Rational } from "kdim";

Rational.from("3/4").toFraction({ format: "nospace" }); // "3/4"
Rational.from("3/4").toFraction({ format: "unicode" }); // "3⁄4"
```