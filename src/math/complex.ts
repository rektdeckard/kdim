import type { Add, Sub, Mul, Div, Pow, Eq } from "./types";

export class ComplexNumber
  implements
    Number,
    Add<ComplexNumber | Number, ComplexNumber>,
    Sub<ComplexNumber | Number, ComplexNumber>,
    Mul<ComplexNumber | Number, ComplexNumber>,
    Div<ComplexNumber | Number, ComplexNumber>,
    Pow<Number, ComplexNumber>,
    Eq<ComplexNumber | Number>
{
  #r: number;
  #i: number;

  constructor(real: number = 0, imaginary: number = 0) {
    this.#r = real;
    this.#i = imaginary;
  }

  get real() {
    return this.#r;
  }

  get imaginary(): number {
    return this.#i;
  }

  static from<N extends ComplexNumber | Number>(init: N): ComplexNumber {
    if (init instanceof ComplexNumber) {
      return init;
    }

    return new ComplexNumber(init.valueOf());
  }

  add(addend: Number | ComplexNumber): ComplexNumber {
    const a = ComplexNumber.from(addend);
    return new ComplexNumber(this.real + a.real, this.imaginary + a.imaginary);
  }

  sub(subtrahend: Number | ComplexNumber): ComplexNumber {
    const s = ComplexNumber.from(subtrahend);
    return new ComplexNumber(this.real - s.real, this.imaginary - s.imaginary);
  }

  mul(multiplicand: Number | ComplexNumber): ComplexNumber {
    const m = ComplexNumber.from(multiplicand);
    return new ComplexNumber(
      this.real * m.real - this.imaginary * m.imaginary,
      this.real * m.imaginary + this.imaginary * m.real
    );
  }

  div(divisor: Number | ComplexNumber): ComplexNumber {
    const divider = ComplexNumber.from(divisor);
    const conjugate = divider.conjugate();
    const dividend = this.mul(conjugate);

    const cdvsr = divider.real ** 2 + divider.imaginary ** 2;
    return new ComplexNumber(dividend.real / cdvsr, dividend.imaginary / cdvsr);
  }

  pow(exponent: Number): ComplexNumber {
    let acc: ComplexNumber = this;
    for (let i = exponent.valueOf() - 1; i > 0; i--) {
      acc = acc.mul(this);
    }

    return acc;
  }

  eq(other: Number | ComplexNumber): boolean {
    const o = ComplexNumber.from(other);
    return this.real === o.real && this.imaginary === o.imaginary;
  }

  conjugate(): ComplexNumber {
    return new ComplexNumber(this.real, -1 * this.imaginary);
  }

  valueOf(): number {
    return this.real;
  }

  toFixed(fractionDigits?: number | undefined): string {
    return this.real.toFixed(fractionDigits);
  }

  toExponential(fractionDigits?: number | undefined): string {
    return this.real.toExponential(fractionDigits);
  }

  toPrecision(precision?: number | undefined): string {
    return this.real.toPrecision(precision);
  }

  toString(_radix?: number | undefined): string {
    return `${this.real === 0 && this.imaginary !== 0 ? "" : this.real}${
      this.imaginary !== 0
        ? (this.imaginary === 1
            ? "+"
            : this.imaginary.toLocaleString("en-US", {
                signDisplay: this.real === 0 ? "auto" : "always",
              })) + "i"
        : ""
    }`;
  }

  toLocaleString(locales?: unknown, options?: unknown): string;
  toLocaleString(
    locales?: Intl.LocalesArgument,
    options?: Intl.NumberFormatOptions | undefined
  ): string;
  toLocaleString(
    _locales?: string | string[] | undefined,
    _options?: Intl.NumberFormatOptions | undefined
  ): string {
    return this.toString();
  }

  [Symbol.toPrimitive](hint: string) {
    if (hint === "string") return this.toString();
    return this.real;
  }

  get [Symbol.toStringTag]() {
    return "ComplexNumber";
  }
}
