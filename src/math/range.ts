import { isConstructor } from "../helper";
import type { Constructor, Factory } from "../helper";

export type RangeOptions = {
  from?: number;
  to: number;
  step?: number;
};

/**
 * Produce lists and iterators over values in discrete ranges.
 *
 * @throws an {@link Error} when attemping to construct. All methods are static.
 */
export class Range implements Iterable<number> {
  private _from: number;
  private _to: number;
  private _step: number;

  constructor(where: number | RangeOptions) {
    const { from, to, step } = Range._config(where);
    this._from = from;
    this._to = to;
    this._step = step;
  }

  *[Symbol.iterator]() {
    for (
      let i = this._from;
      this._from < this._to ? i <= this._to : i >= this._to;
      i += this._step
    ) {
      yield i;
    }
  }

  contains(value: number | Range): boolean {
    const mmin = this._step > 0 ? this._from : this._to;
    const mmax = this._step > 0 ? this._to : this._from;

    if (value instanceof Range) {
      const vmin = value._step > 0 ? value._from : value._to;
      const vmax = value._step > 0 ? value._to : value._from;
      return mmin <= vmin && mmax >= vmax;
    }

    return value >= mmin && value <= mmax;
  }

  private static _config<N = number>(
    where: number | RangeOptions,
    factory?:
      | Constructor<N, [n: number, index: number]>
      | Factory<N, [n: number, index: number]>
  ) {
    let {
      from = 0,
      to = 0,
      step = 1,
    } = typeof where === "object" ? where : { to: where - Math.sign(where) };

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

    const produce: (n: number, index: number) => N = !factory
      ? (n) => n as N
      : isConstructor<N, [number, number]>(factory, from, 0)
        ? (n, i) => new factory(n, i)
        : factory;

    return { from, to, step, produce };
  }

  /**
   * Produce an {@link Array} of values over a finite range.
   *
   * @param where A number or configuration object. When `where` is a number, range is
   * inferred to be [0, `where`), with a step size of 1, or -1 if `where < 0`. When
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
   * const list = Range.of(3); // [0, 1, 2]
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
    where: number | RangeOptions,
    factory?:
      | Constructor<N, [n: number, index?: number]>
      | Factory<N, [n: number, index?: number]>
  ): N[] {
    const { from, to, step, produce } = Range._config(where, factory);

    const values: N[] = [];
    for (let i = from, j = 0; from < to ? i <= to : i >= to; i += step, j++) {
      values.push(produce(i, j));
    }

    return values;
  }

  /**
   * Produce a {@link Generator} of values over both finite and infinite ranges.
   *
   * @param where A number or configuration object. When `where` is a number, range is
   * inferred to be [0, `where`), with a step size of 1, or -1 if `where < 0`. When
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
    where: number | RangeOptions,
    factory?:
      | Constructor<N, [n: number, index?: number]>
      | Factory<N, [n: number, index?: number]>
  ): Generator<N, void, void> {
    const { from, to, step, produce } = Range._config(where, factory);

    for (let i = from, j = 0; from < to ? i <= to : i >= to; i += step, j++) {
      yield produce(i, j);
    }
  }
}
