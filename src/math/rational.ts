import { assertInteger } from "./assertions";
import { gcf, lcm } from "./utils";
import type {
  Add,
  Sub,
  Mul,
  Div,
  Pow,
  Mod,
  Abs,
  Eq,
  Gt,
  Gte,
  Lt,
  Lte,
} from "./types";

export const FRACTION_SLASH = "\u2044";

export type RationalFormat = "space" | "nospace" | "unicode";

export type RationalFormatOptions = {
  mixed?: boolean;
  format?: RationalFormat;
};

export type RationalLike =
  | [rational: RationalNumber]
  | [numerator: number]
  | [numerator: number, denominator: number];

/**
 * A rational number class for fraction arithmetic without loss of precision.
 * Operations are only guaranteed where numerator and denominator are within
 * {@link Number.MIN_SAFE_INTEGER} and {@link Number.MAX_SAFE_INTEGER}.
 */
export class RationalNumber
  implements
    Number,
    Add<RationalLike, RationalNumber>,
    Sub<RationalLike, RationalNumber>,
    Mul<RationalLike, RationalNumber>,
    Div<RationalLike, RationalNumber>,
    Pow<[number], RationalNumber>,
    Mod<[number], RationalNumber>,
    Abs<RationalNumber>,
    Eq<RationalLike>,
    Gt<RationalLike>,
    Gte<RationalLike>,
    Lt<RationalLike>,
    Lte<RationalLike>
{
  #n: number;
  #d: number;

  constructor(numerator: number, denominator: number = 1) {
    assertInteger(numerator, denominator);

    this.#n = numerator;
    this.#d = denominator;

    this.#simplify();
  }

  get numerator() {
    return this.#n;
  }

  get denominator() {
    return this.#d;
  }

  static from(...input: RationalLike | [fraction: string]): RationalNumber {
    const [base, opt] = input;

    return base instanceof RationalNumber
      ? base
      : typeof base === "string"
      ? RationalNumber.parse(base)
      : typeof opt === "number"
      ? (assertInteger(base, opt), new RationalNumber(base, opt))
      : (assertInteger(base), new RationalNumber(base, opt));
  }

  static parse(fraction: string): RationalNumber {
    let [nString, dString] = fraction.split(/[\/\u2044]/);

    const [first, second] = nString.trim().split(/\s+/);
    if (second !== undefined) {
      const denominator = Number(dString);
      const numerator = Number(first) * denominator + Number(second);

      assertInteger(numerator, denominator);
      return new RationalNumber(numerator, denominator);
    } else {
      const denominator = Number(dString);
      const numerator = Number(first);

      assertInteger(numerator, denominator);
      return new RationalNumber(numerator, denominator);
    }
  }

  #simplify() {
    const factor = gcf(this.numerator, this.denominator);
    if (factor !== 1) {
      this.#n /= factor;
      this.#d /= factor;
    }

    if (Math.sign(this.#d) < 0) {
      this.#n *= -1;
      this.#d *= -1;
    }

    return this;
  }

  #factor(other: RationalNumber): {
    denominator: number;
    numerator: number;
    otherNumerator: number;
  } {
    const denominator = lcm(this.denominator, other.denominator);

    const mFac = denominator / this.denominator;
    const numerator = mFac === 1 ? this.#n : this.#n * mFac;

    const oFac = denominator / other.denominator;
    const otherNumerator = oFac === 1 ? other.#n : other.#n * oFac;

    return {
      denominator,
      numerator,
      otherNumerator,
    };
  }

  recip(): RationalNumber {
    return new RationalNumber(this.denominator, this.numerator);
  }

  add(...addend: RationalLike): RationalNumber {
    const other = RationalNumber.from(...addend);
    if (other.denominator === this.denominator) {
      return new RationalNumber(
        this.numerator + other.numerator,
        this.denominator
      );
    }

    const { denominator, numerator, otherNumerator } = this.#factor(other);
    return new RationalNumber(numerator + otherNumerator, denominator);
  }

  sub(...subtrahend: RationalLike): RationalNumber {
    const other = RationalNumber.from(...subtrahend);
    if (other.denominator === this.denominator) {
      return new RationalNumber(
        this.numerator - other.numerator,
        this.denominator
      );
    }

    const { denominator, numerator, otherNumerator } = this.#factor(other);
    return new RationalNumber(numerator - otherNumerator, denominator);
  }

  mul(...multiplicand: RationalLike): RationalNumber {
    const other = RationalNumber.from(...multiplicand);
    return new RationalNumber(
      this.numerator * other.numerator,
      this.denominator * other.denominator
    );
  }

  div(...divisor: RationalLike): RationalNumber {
    const other = RationalNumber.from(...divisor);
    return new RationalNumber(
      this.numerator * other.denominator,
      this.denominator * other.numerator
    );
  }

  pow(exponent: number): RationalNumber {
    // TODO: support fractional exponents?
    assertInteger(exponent);
    return new RationalNumber(
      Math.pow(this.numerator, exponent),
      Math.pow(this.denominator, exponent)
    );
  }

  mod(modulus: number): RationalNumber {
    assertInteger(modulus);
    return new RationalNumber(
      this.numerator % (modulus * this.denominator),
      this.denominator
    );
  }

  abs(): RationalNumber {
    return new RationalNumber(
      Math.abs(this.numerator),
      Math.abs(this.denominator)
    );
  }

  eq(...other: RationalLike): boolean {
    const r = RationalNumber.from(...other);
    return this.numerator === r.numerator && this.denominator === r.denominator;
  }

  gt(...other: RationalLike): boolean {
    const r = RationalNumber.from(...other);
    const { numerator, otherNumerator } = this.#factor(r);
    return numerator > otherNumerator;
  }

  gte(...other: RationalLike): boolean {
    const r = RationalNumber.from(...other);
    const { numerator, otherNumerator } = this.#factor(r);
    return numerator >= otherNumerator;
  }

  lt(...other: RationalLike): boolean {
    const r = RationalNumber.from(...other);
    const { numerator, otherNumerator } = this.#factor(r);
    return numerator < otherNumerator;
  }

  lte(...other: RationalLike): boolean {
    const r = RationalNumber.from(...other);
    const { numerator, otherNumerator } = this.#factor(r);
    return numerator <= otherNumerator;
  }

  toFraction({
    mixed = false,
    format = "nospace",
  }: RationalFormatOptions = {}): string {
    const separator =
      format === "nospace"
        ? "/"
        : format === "unicode"
        ? FRACTION_SLASH
        : " / ";

    if (!mixed) {
      return `${this.numerator}${separator}${this.denominator}`;
    }

    const v = this.valueOf();
    if (Number.isInteger(v)) return v.toString();

    const [whole, part] = [
      Math.trunc(this.numerator / this.denominator),
      Math.abs(this.numerator % this.denominator),
    ];

    if (whole !== 0) {
      return `${whole} ${part}${separator}${this.denominator}`;
    }

    return `${this.numerator}${separator}${this.denominator}`;
  }

  valueOf() {
    return this.numerator / this.denominator;
  }

  toFixed(fractionDigits?: number | undefined): string {
    return this.valueOf().toFixed(fractionDigits);
  }

  toExponential(fractionDigits?: number | undefined): string {
    return this.valueOf().toExponential(fractionDigits);
  }

  toPrecision(precision?: number | undefined): string {
    return this.valueOf().toPrecision(precision);
  }

  toString(radix?: number | undefined): string {
    return this.valueOf().toString(radix);
  }

  get [Symbol.toStringTag]() {
    return "RationalNumber";
  }

  [Symbol.toPrimitive](hint: string) {
    if (hint === "number") {
      return this.valueOf();
    }
    return this.toFraction({ mixed: false, format: "nospace" });
  }
}
