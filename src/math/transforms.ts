import { assertValidRange } from "./assertions";
import { isConstructor } from "../helper";

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
 * @param min the lower bound of the range (inclusive)
 * @param max the upper bound of the range (inclusive)
 * @param value the value to clamp
 * @returns the constrained value
 * @throws a {@link RangeError} when range is invalid
 */
export function clamp(min: number, max: number, value: number): number {
  assertValidRange(min, max);
  return uncheckedClamp(min, max, value);
}

/**
 * Interpolate a value over a given range.
 *
 * @param start the beginning of the range
 * @param end the end of the range
 * @param value a number between 0 and 1 (inclusive) representing a point in
 * the range
 * @returns the interpolated value
 * @throws a {@link RangeError} when the value is outside of [0, 1]
 */
export function lerp(start: number, end: number, value: number): number {
  if (0 > value || value > 1)
    throw new RangeError("Value must be between 0 and 1 inclusive");

  return start + (end - start) * value;
}

export function range<N = number>(
  where: number | { from?: number; to: number; step?: number },
  ctor?:
    | { new (n: number, ...rest: any[]): N }
    | ((n: number, ...rest: any[]) => N)
): N[] {
  let {
    from = 0,
    to = 0,
    step = 1,
  } = typeof where === "object" ? where : { to: where };

  if (step <= 0) {
    throw new Error(
      "step size must be positive; its sign is inferred from the range"
    );
  }

  if (from > to) {
    step *= -1;
  }

  const values: N[] = [];
  for (let i = from; from < to ? i <= to : i >= to; i += step) {
    if (!ctor) {
      values.push(i as unknown as N);
      continue;
    }

    if (isConstructor<N, [number, ...any]>(ctor)) {
      values.push(new ctor(i));
    } else {
      values.push((ctor as (n: number) => N)(i));
    }
  }

  return values;
}
