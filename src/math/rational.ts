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
  | [rational: Rational]
  | [numerator: number]
  | [numerator: number, denominator: number];

/**
 * A rational number class for fraction arithmetic without loss of precision.
 * Operations are only guaranteed where numerator and denominator are within
 * {@link Number.MIN_SAFE_INTEGER} and {@link Number.MAX_SAFE_INTEGER}.
 */
export class Rational
  implements
    Number,
    Add<RationalLike, Rational>,
    Sub<RationalLike, Rational>,
    Mul<RationalLike, Rational>,
    Div<RationalLike, Rational>,
    Pow<[number], Rational>,
    Mod<[number], Rational>,
    Abs<Rational>,
    Eq<RationalLike>,
    Gt<RationalLike>,
    Gte<RationalLike>,
    Lt<RationalLike>,
    Lte<RationalLike>
{
  #n: number;
  #d: number;

  constructor(numerator: number, denominator: number = 1) {
    if (denominator === 0) {
      throw new RangeError("Cannot divide by zero");
    }

    if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
      const n = new Rational(...Rational.#rationalize(numerator));
      const self = n.div(...Rational.#rationalize(denominator));

      this.#n = self.numerator;
      this.#d = self.denominator;
    } else {
      this.#n = numerator;
      this.#d = denominator;
    }

    this.#simplify();
  }

  get numerator() {
    return this.#n;
  }

  get denominator() {
    return this.#d;
  }

  static from(...input: RationalLike | [fraction: string]): Rational {
    const [base, opt] = input;

    return base instanceof Rational
      ? base
      : typeof base === "string"
        ? Rational.parse(base)
        : new Rational(base, opt);
  }

  static parse(fraction: string): Rational {
    let [nString, dString] = fraction.split(/[\/\u2044]/);

    const [first, second] = nString.trim().split(/\s+/);
    if (second !== undefined) {
      const denominator = Number(dString);
      const numerator = Number(first) * denominator + Number(second);
      return new Rational(numerator, denominator);
    } else {
      const denominator = Number(dString);
      const numerator = Number(first);
      return new Rational(numerator, denominator);
    }
  }

  static #rationalize(
    n: number,
    precision: number = 0.0000001
  ): [number, number] {
    // TODO: implement with Stern-Brocot tree?
    // https://en.wikipedia.org/wiki/Stern%E2%80%93Brocot_tree

    // Continued fraction method
    // https://en.wikipedia.org/wiki/Continued_fraction
    if (Number.isInteger(n)) return [n, 1];

    function integerDecimal(n: number): [number, number] {
      return [Math.trunc(n), n % 1];
    }

    const components = [];
    let x = n;
    while (true) {
      const [integer, decimal] = integerDecimal(x);
      components.unshift(integer);

      if (decimal < precision) {
        break;
      }

      if (decimal !== 0) {
        x = 1 / decimal;
      }
    }

    const base = components.pop()!;
    let r = new Rational(0);
    for (const c of components) {
      r = new Rational(c).add(r).recip();
    }
    r = r.add(base);
    return [r.numerator, r.denominator];
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

  #factor(other: Rational): {
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

  recip(): Rational {
    return new Rational(this.denominator, this.numerator);
  }

  add(...addend: RationalLike): Rational {
    const other = Rational.from(...addend);
    if (other.denominator === this.denominator) {
      return new Rational(this.numerator + other.numerator, this.denominator);
    }

    const { denominator, numerator, otherNumerator } = this.#factor(other);
    return new Rational(numerator + otherNumerator, denominator);
  }

  sub(...subtrahend: RationalLike): Rational {
    const other = Rational.from(...subtrahend);
    if (other.denominator === this.denominator) {
      return new Rational(this.numerator - other.numerator, this.denominator);
    }

    const { denominator, numerator, otherNumerator } = this.#factor(other);
    return new Rational(numerator - otherNumerator, denominator);
  }

  mul(...multiplicand: RationalLike): Rational {
    const other = Rational.from(...multiplicand);
    return new Rational(
      this.numerator * other.numerator,
      this.denominator * other.denominator
    );
  }

  div(...divisor: RationalLike): Rational {
    const other = Rational.from(...divisor);
    return new Rational(
      this.numerator * other.denominator,
      this.denominator * other.numerator
    );
  }

  pow(exponent: number): Rational {
    return new Rational(
      Math.pow(this.numerator, exponent),
      Math.pow(this.denominator, exponent)
    );
  }

  mod(modulus: number): Rational {
    assertInteger(modulus);
    return new Rational(
      this.numerator % (modulus * this.denominator),
      this.denominator
    );
  }

  abs(): Rational {
    return new Rational(Math.abs(this.numerator), Math.abs(this.denominator));
  }

  eq(...other: RationalLike): boolean {
    const r = Rational.from(...other);
    return this.numerator === r.numerator && this.denominator === r.denominator;
  }

  gt(...other: RationalLike): boolean {
    const r = Rational.from(...other);
    const { numerator, otherNumerator } = this.#factor(r);
    return numerator > otherNumerator;
  }

  gte(...other: RationalLike): boolean {
    const r = Rational.from(...other);
    const { numerator, otherNumerator } = this.#factor(r);
    return numerator >= otherNumerator;
  }

  lt(...other: RationalLike): boolean {
    const r = Rational.from(...other);
    const { numerator, otherNumerator } = this.#factor(r);
    return numerator < otherNumerator;
  }

  lte(...other: RationalLike): boolean {
    const r = Rational.from(...other);
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
    return "Rational";
  }

  [Symbol.toPrimitive](hint: string) {
    if (hint === "number") {
      return this.valueOf();
    }
    return this.toFraction({ mixed: false, format: "nospace" });
  }
}
