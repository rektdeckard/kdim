import { assertValidRange, castInteger } from "./assertions";
import { uncheckedClamp } from "./transforms";
import { Add, Sub, Mul, Div, Eq, Bounded, BoundedOptions } from "./types";

/**
 * A saturating (or clamping) integer class implementing {@link Number},
 * allowing a value to be constrained to an arbitrary range, and clamping
 * it to the bounds when arithmetic operations would cause it to overflow or
 * underflow.
 *
 * @example
 * const level = new Saturating({ min: 1, max: 99 });
 * level.add(50); // 51
 * level.add(30); // 81
 * level.add(30); // 99
 *
 * @throws a {@link RangeError} when range or value is invalid, or when
 * arguments to arithmetic methods are non-integers.
 * @throws an {@link Error} when attemping to `div()` by zero.
 */
export class Saturating
  implements
    Number,
    Bounded,
    Add<[Number], Saturating>,
    Sub<[Number], Saturating>,
    Mul<[Number], Saturating>,
    Div<[Number], Saturating>,
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
      throw new RangeError("Values must be integers");
    }

    assertValidRange(min, max);

    this.#max = max;
    this.#min = min;
    this.#value = value !== undefined ? uncheckedClamp(min, max, value) : min;
  }

  static from(bounded: Bounded) {
    return new Saturating(
      { max: bounded.max, min: bounded.min },
      bounded.value
    );
  }

  add<N extends Number>(n: N) {
    const addend = typeof n === "number" ? n : Number(n);
    if (addend === 0) return this;

    return new Saturating(
      { min: this.#min, max: this.#max },
      this.#value + addend
    );
  }

  sub<N extends Number>(n: N) {
    return this.add(-n);
  }

  mul<N extends Number>(n: N) {
    const multiplier = castInteger(n);
    if (multiplier === 1) return this;

    return new Saturating(
      { min: this.#min, max: this.#max },
      this.#value * multiplier
    );
  }

  div<N extends Number>(n: N) {
    const divisor = castInteger(n);
    if (divisor === 0) throw new Error("Cannot divide by zero");

    return new Saturating(
      { min: this.#min, max: this.#max },
      Math.trunc(this.#value / divisor)
    );
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
    return "Saturating";
  }
}
