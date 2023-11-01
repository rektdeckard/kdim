import type { Add, Sub, Mul, Div, Pow, Abs, Eq } from "./types";

export class Complex
  implements
    Number,
    Add<[Complex | Number], Complex>,
    Sub<[Complex | Number], Complex>,
    Mul<[Complex | Number], Complex>,
    Div<[Complex | Number], Complex>,
    Pow<[Number], Complex>,
    Abs<Complex>,
    Eq<[Complex | Number]>
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

  static from<N extends Complex | Number>(init: N): Complex {
    if (init instanceof Complex) {
      return init;
    }

    return new Complex(init.valueOf());
  }

  add(addend: Number | Complex): Complex {
    const a = Complex.from(addend);
    return new Complex(this.real + a.real, this.imaginary + a.imaginary);
  }

  sub(subtrahend: Number | Complex): Complex {
    const s = Complex.from(subtrahend);
    return new Complex(this.real - s.real, this.imaginary - s.imaginary);
  }

  mul(multiplicand: Number | Complex): Complex {
    const m = Complex.from(multiplicand);
    return new Complex(
      this.real * m.real - this.imaginary * m.imaginary,
      this.real * m.imaginary + this.imaginary * m.real
    );
  }

  div(divisor: Number | Complex): Complex {
    const divider = Complex.from(divisor);
    const conjugate = divider.conjugate();
    const dividend = this.mul(conjugate);

    const cdvsr = divider.real ** 2 + divider.imaginary ** 2;
    return new Complex(dividend.real / cdvsr, dividend.imaginary / cdvsr);
  }

  pow(exponent: Number): Complex {
    let acc: Complex = this;
    for (let i = exponent.valueOf() - 1; i > 0; i--) {
      acc = acc.mul(this);
    }

    return acc;
  }

  abs(): Complex {
    if (Math.sign(this.#r) === Math.sign(this.#i)) return this;
    return new Complex(Math.abs(this.#r), Math.abs(this.#i));
  }

  eq(...other: [Number | Complex]): boolean {
    const o = Complex.from(...other);
    return this.real === o.real && this.imaginary === o.imaginary;
  }

  conjugate(): Complex {
    return new Complex(this.real, -1 * this.imaginary);
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
    return "Complex";
  }
}
