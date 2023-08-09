import { Add, Sub, Mul, Div, Pow, Eq } from "./types";

export class SimpleNumber
  implements
    Number,
    Add<SimpleNumber>,
    Sub<SimpleNumber>,
    Mul<SimpleNumber>,
    Div<SimpleNumber>,
    Pow<SimpleNumber>,
    Eq<Number>
{
  #value: number;

  constructor(value: number) {
    this.#value = value;
  }

  valueOf(): number {
    return this.#value;
  }

  add(addend: SimpleNumber): SimpleNumber {
    return new SimpleNumber(this.#value + addend.#value);
  }

  sub(subtrahend: SimpleNumber): SimpleNumber {
    return new SimpleNumber(this.#value - subtrahend.#value);
  }

  mul(multiplicand: SimpleNumber): SimpleNumber {
    return new SimpleNumber(this.#value * multiplicand.#value);
  }

  div(dividend: SimpleNumber): SimpleNumber {
    return new SimpleNumber(this.#value / dividend.#value);
  }

  pow(exponent: SimpleNumber): SimpleNumber {
    return new SimpleNumber(this.#value ** exponent.#value);
  }

  eq(other: Number): boolean {
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
