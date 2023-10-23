import { isConstructor } from "../helper";
import type { Constructor, Factory } from "../helper";

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

    if (from === to) {
      throw new Error("Range must be nonzero in size");
    }

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