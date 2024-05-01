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
  private _value: number;

  constructor(value: number) {
    this._value = value;
  }

  static from(value: Float | Number): Float {
    if (value instanceof Float) {
      return value;
    }

    return new Float(value.valueOf());
  }

  valueOf(): number {
    return this._value;
  }

  add(addend: Float | Number): Float {
    return new Float(this._value + addend.valueOf());
  }

  sub(subtrahend: Float | Number): Float {
    return new Float(this._value - subtrahend.valueOf());
  }

  mul(multiplicand: Float | Number): Float {
    return new Float(this._value * multiplicand.valueOf());
  }

  div(dividend: Float | Number): Float {
    return new Float(this._value / dividend.valueOf());
  }

  pow(exponent: Float | Number): Float {
    return new Float(this._value ** exponent.valueOf());
  }

  sin(): Float {
    return new Float(Math.sin(this._value));
  }

  cos(): Float {
    return new Float(Math.cos(this._value));
  }

  tan(): Float {
    return new Float(Math.tan(this._value));
  }

  abs(): Float {
    if (Math.sign(this._value) > 0) return this;
    return new Float(Math.abs(this._value));
  }

  eq(other: Float | Number): boolean {
    return this._value === other.valueOf();
  }

  toFixed(fractionDigits?: number | undefined): string {
    return this._value.toFixed(fractionDigits);
  }

  toExponential(fractionDigits?: number | undefined): string {
    return this._value.toExponential(fractionDigits);
  }

  toPrecision(precision?: number | undefined): string {
    return this._value.toPrecision(precision);
  }
}
