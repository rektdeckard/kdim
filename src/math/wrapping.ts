import { assertValidRange, castInteger } from "./assertions";
import type { Add, Sub, Eq, Bounded, BoundedOptions } from "./types";

/**
 * A wrapping integer class implementing {@link Number}, allowing a value
 * to be constrained to an arbitrary range, and wrapping around the range
 * when arithmetic operations cause it to overflow or underflow.
 *
 * @example
 * const u16 = new Wrapping({ max: 0xFFFF }, 1);
 * u16.add(0xFFFD); // 0xFFFE
 * u16.add(1);      // 0xFFFF
 * u16.add(1);      // 0x0000
 * u16.add(1);      // 0x0001
 *
 * @throws a {@link RangeError} when range or value is invalid, or when
 * arguments to arithmetic methods are non-integers.
 */
export class Wrapping
  implements
    Bounded,
    Number,
    Add<[Number], Wrapping>,
    Sub<[Number], Wrapping>,
    Eq<[Number]>
{
  #max: number;
  #min: number;
  #value: number;

  constructor({ max, min = 0 }: BoundedOptions, value?: number) {
    if (
      !Number.isSafeInteger(min) ||
      !Number.isSafeInteger(max) ||
      (typeof value !== "undefined" && !Number.isSafeInteger(value))
    ) {
      throw new RangeError("Values must be safe integers");
    }

    assertValidRange(min, max, value);

    this.#max = max;
    this.#min = min;
    this.#value = value ?? min;
  }

  static from(bounded: Bounded) {
    return new Wrapping({ max: bounded.max, min: bounded.min }, bounded.value);
  }

  add<N extends Number>(n: N) {
    const addend = castInteger(n);
    if (addend === 0) return this;

    let v = this.#value;
    if (v + addend <= this.#max && v + addend >= this.#min) {
      v += addend;
    } else {
      const modAddend = addend % (Math.abs(this.#max - this.#min) + 1);

      if (v + modAddend <= this.#max && v + modAddend >= this.#min) {
        v += modAddend;
      } else if (modAddend > 0) {
        v = modAddend - (this.#max - v) + (this.#min - 1);
      } else if (modAddend < 0) {
        v = modAddend - (this.#min - v) + (this.#max + 1);
      }
    }

    return new Wrapping({ min: this.#min, max: this.#max }, v);
  }

  sub<N extends Number>(n: N) {
    return this.add(-n);
  }

  eq(other: Number): boolean {
    return this.#value === other.valueOf();
  }

  get value() {
    return this.#value;
  }

  get min() {
    return this.#min;
  }

  get max() {
    return this.#max;
  }

  valueOf(): number {
    return this.#value;
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

  toString(radix?: number | undefined): string {
    return this.#value.toString(radix);
  }

  toLocaleString(locales?: unknown, options?: unknown): string;
  toLocaleString(
    locales?: Intl.LocalesArgument,
    options?: Intl.NumberFormatOptions | undefined
  ): string;
  toLocaleString(
    locales?: string | string[] | undefined,
    options?: Intl.NumberFormatOptions | undefined
  ): string {
    return this.#value.toLocaleString(locales, options);
  }

  [Symbol.toPrimitive](hint: string) {
    if (hint === "string") return this.toString();
    return this.#value;
  }

  get [Symbol.toStringTag]() {
    return "Wrapping";
  }
}