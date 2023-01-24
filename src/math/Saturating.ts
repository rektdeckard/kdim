import { assertValidRange, castInteger } from "./assertions";
import { uncheckedClamp } from "./transforms";

export type SaturatingOptions = {
  max: number;
  min?: number;
};

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
 * @throws {@link RangeError} when range or value is invalid, or when
 * arguments to arithmetic methods are non-integers.
 * @throws {@link Error} when attemping to `div()` by zero.
 */
export class Saturating implements Number {
  #max: number;
  #min: number;
  #value: number;

  constructor({ max, min = 0 }: SaturatingOptions, value?: number) {
    if (
      !Number.isSafeInteger(min) ||
      !Number.isSafeInteger(max) ||
      (typeof value !== "undefined" && !Number.isSafeInteger(value))
    ) {
      throw new RangeError("Values must be integers");
    }

    assertValidRange(min, max, value);

    this.#max = max;
    this.#min = min;
    this.#value = value ?? min;
  }

  static from(wrapping: Saturating) {
    return new Saturating(
      { max: wrapping.max, min: wrapping.min },
      wrapping.value
    );
  }

  add<N extends Number>(n: N) {
    const addend = typeof n === "number" ? n : Number(n);

    if (!Number.isSafeInteger(addend)) {
      throw new RangeError("Values must be integers");
    }

    if (addend === 0) return this;

    this.#value = uncheckedClamp(this.#min, this.#max, this.#value + addend);
    return this;
  }

  sub<N extends Number>(n: N) {
    return this.add(-n);
  }

  mul<N extends Number>(n: N) {
    const multiplier = castInteger(n);
    if (multiplier === 1) return this;

    this.#value = uncheckedClamp(
      this.#min,
      this.#max,
      this.#value * multiplier
    );
    return this;
  }

  div<N extends Number>(n: N) {
    const divisor = castInteger(n);
    if (divisor === 0) throw new Error("Cannot divide by zero");

    this.#value = uncheckedClamp(
      this.#min,
      this.#max,
      Math.trunc(this.#value / divisor)
    );
    return this;
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
