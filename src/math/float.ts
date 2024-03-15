import type { Add, Sub, Mul, Div, Pow, Trig, Abs, Eq } from "./types";

export class Float
  implements
    Number,
    Add<[Float | Number], Float>,
    Sub<[Float | Number], Float>,
    Mul<[Float | Number], Float>,
    Div<[Float | Number], Float>,
    Pow<[Float | Number], Float>,
    Trig<Float>,
    Abs<Float>,
    Eq<[Number]>
{
  #value: number;

  constructor(value: number) {
    this.#value = value;
  }

  static from(value: Float | Number): Float {
    if (value instanceof Float) {
      return value;
    }

    return new Float(value.valueOf());
  }

  valueOf(): number {
    return this.#value;
  }

  add(addend: Float | Number): Float {
    return new Float(this.#value + addend.valueOf());
  }

  sub(subtrahend: Float | Number): Float {
    return new Float(this.#value - subtrahend.valueOf());
  }

  mul(multiplicand: Float | Number): Float {
    return new Float(this.#value * multiplicand.valueOf());
  }

  div(dividend: Float | Number): Float {
    return new Float(this.#value / dividend.valueOf());
  }

  pow(exponent: Float | Number): Float {
    return new Float(this.#value ** exponent.valueOf());
  }

  sin(): Float {
    return new Float(Math.sin(this.#value));
  }

  cos(): Float {
    return new Float(Math.cos(this.#value));
  }

  tan(): Float {
    return new Float(Math.tan(this.#value));
  }

  abs(): Float {
    if (Math.sign(this.#value) > 0) return this;
    return new Float(Math.abs(this.#value));
  }

  eq(other: Float | Number): boolean {
    return this.#value === other.valueOf();
  }

  toFixed(fractionDigits?: number | undefined): string {
    return this.#value.toFixed(fractionDigits);
  }

  toExponential(fractionDigits?: number | undefined): string {
    return this.#value.toExponential(fractionDigits);
  }

  toPrecision(precision?: number | undefined): string {
    return this.#value.toPrecision(precision);
  }
}
