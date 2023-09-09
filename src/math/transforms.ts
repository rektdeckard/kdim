import { assertNatural, assertValidRange } from "./assertions";
import { isConstructor } from "../helper";
import type { Constructor, Factory } from "../helper";

/**
 * Constrain a value to within a given range, if not already within range.
 *
 * @param min The lower bound of the range (inclusive)
 * @param max The upper bound of the range (inclusive)
 * @param value The value to clamp
 * @returns The constrained value
 */
export function uncheckedClamp(
  min: number,
  max: number,
  value: number
): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Constrain a value to within a given range, if not already within range.
 *
 * @param min The lower bound of the range (inclusive)
 * @param max The upper bound of the range (inclusive)
 * @param value The value to clamp
 * @returns The constrained value
 * @throws a {@link RangeError} when range is invalid
 */
export function clamp(min: number, max: number, value: number): number {
  assertValidRange(min, max);
  return uncheckedClamp(min, max, value);
}

/**
 * Interpolate a value over a given range.
 *
 * @param from The beginning of the range
 * @param to The end of the range
 * @param value A number between 0 and 1 (inclusive) representing a point in
 * the range
 * @returns The interpolated value
 * @throws a {@link RangeError} when the value is outside of [0, 1]
 */
export function lerp(from: number, to: number, value: number): number {
  if (0 > value || value > 1)
    throw new RangeError("Value must be between 0 and 1 inclusive");

  return from + (to - from) * value;
}

/**
 * Returns the factorial of a number
 *
 * @param n a counting number
 * @returns n!
 * @throws a {@link RangeError} when n is not a counting number
 */
export function factorial(n: number): number {
  assertNatural(n);
  if (n <= 2) return n;

  let t = n;
  let i = n;
  while (i > 1) {
    i--;
    t = t * i;
  }

  return t;
}

/**
 * Produce lists and iterators over values in discrete ranges.
 *
 * @throws an {@link Error} when attemping to construct. All methods are static.
 */
export class Range {
  constructor(..._: never) {
    throw new Error(
      "Range contains static methods only and is not meant to be constructed"
    );
  }

  static #config<N = number>(
    where: number | { from?: number; to: number; step?: number },
    factory?: Constructor<N, [n: number]> | Factory<N, [n: number]>
  ) {
    let {
      from = 0,
      to = 0,
      step = 1,
    } = typeof where === "object" ? where : { to: where };

    if (step <= 0) {
      throw new Error(
        "Step size must be positive, as its sign is inferred from the range"
      );
    }

    if (from > to) {
      step *= -1;
    }

    const produce: (i: number) => N = !factory
      ? (i) => i as N
      : isConstructor<N, [number]>(factory, from)
      ? (i) => new factory(i)
      : (i) => factory(i);

    return { from, to, step, produce };
  }

  /**
   * Produce an {@link Array} of values over a finite range.
   *
   * @param where A number or configuration object. When `where` is a number, range is
   * inferred to be [0, `where`], with a step size of 1, or -1 if `where < 0`. When
   * `where` is an object, it contains a `to` property, and optional `from` and `step`
   * properties, all numbers. If `step` is provided it must be positive, as the step
   * sign is inferred by the range direction.
   * @param factory An optional factory or constructor to be called with each value in
   * the range to produce values. When omitted, the values in the range will be the numbers
   * of that range.
   * @returns An array of values
   *
   * @example
   * // Producing a simple numeric range
   * const list = Range.of(3); // [0, 1, 2, 3]
   *
   * @example
   * // Producing a range with specific bounds and step size
   * const odds = Range.of({ from: 1, to: 9, step: 2 }); // [1, 3, 5, 7, 9]
   *
   * @example
   * // Producing a range of objects using a factory
   * const nsAndSquares = Range.of({ to: 4 }, (n) => ({ n, sq: n * n }));
   * // [
   * //   { n: 0, sq: 0 },
   * //   { n: 1, sq: 1 },
   * //   { n: 2, sq: 4 },
   * //   { n: 3, sq: 9 },
   * //   { n: 4, sq: 16 },
   * // ]
   */
  static of<N = number>(
    where: number | { from?: number; to: number; step?: number },
    factory?: Constructor<N, [n: number]> | Factory<N, [n: number]>
  ): N[] {
    const { from, to, step, produce } = Range.#config(where, factory);

    const values: N[] = [];
    for (let i = from; from < to ? i <= to : i >= to; i += step) {
      values.push(produce(i));
    }

    return values;
  }

  /**
   * Produce a {@link Generator} of values over both finite and infinite ranges.
   *
   * @param where A number or configuration object. When `where` is a number, range is
   * inferred to be [0, `where`], with a step size of 1, or -1 if `where < 0`. When
   * `where` is an object, it contains a `to` property, and optional `from` and `step`
   * properties, all numbers. If `step` is provided it must be positive, as the step
   * sign is inferred by the range direction.
   * @param factory An optional factory or constructor to be called with each value in
   * the range to produce values. When omitted, the values in the range will be the numbers
   * of that range.
   * @returns A generator of values
   *
   * @example
   * // Iterating an infinite range
   * const odds = Range.lazy({ from: 1, to: Infinity, step: 2 });
   * odds.next(); // { value: 1, done: false }
   * odds.next(); // { value: 3, done: false }
   * odds.next(); // { value: 5, done: false }
   *
   * @example
   * // Using the generator as an iterable
   * const descending = Range.lazy(-Infinity);
   *
   * for (const n of descending) {
   *   if (n < -3) break;
   *   console.log(n);
   * }
   * // 0
   * // -1
   * // -2
   * // -3
   */
  static *lazy<N = number>(
    where: number | { from?: number; to: number; step?: number },
    factory?: Constructor<N, [n: number]> | Factory<N, [n: number]>
  ): Generator<N, void, void> {
    const { from, to, step, produce } = Range.#config(where, factory);

    for (let i = from; from < to ? i <= to : i >= to; i += step) {
      yield produce(i);
    }
  }
}
